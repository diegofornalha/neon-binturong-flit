import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get("date_preset") || "last_30d"

    const db = await getDb()
    const settings = db.data.settings
    const ai = (settings as any)?.ai
    const fb = settings?.facebook

    if (!ai?.apiKey) {
      return NextResponse.json({ success: false, error: "Chave de IA não configurada. Vá em Configurações → Geral." }, { status: 400 })
    }
    if (!fb?.accessToken) {
      return NextResponse.json({ success: false, error: "Facebook não configurado. Configure em Configurações → Facebook Ads." }, { status: 400 })
    }

    const accountId = (fb.accounts && fb.accounts[0]?.account_id) || "2086645648498466"
    const accessToken = fb.accessToken

    // Buscar métricas reais do período
    const baseUrl = "https://graph.facebook.com/v18.0"
    const fields = [
      "campaign_id","campaign_name","impressions","clicks","spend","reach","frequency","ctr","cpc","cpm","actions","date_start","date_stop"
    ].join(",")
    const url = `${baseUrl}/act_${accountId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${accessToken}&limit=500`

    const resp = await fetch(url)
    const data = await resp.json()
    if (!resp.ok || data.error) {
      const message = data?.error?.message || `HTTP ${resp.status} ${resp.statusText}`
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    const rows: any[] = data.data || []
    const totals = rows.reduce((acc, r) => {
      acc.impressions += Number(r.impressions || 0)
      acc.clicks += Number(r.clicks || 0)
      acc.spend += Number(r.spend || 0)
      acc.reach += Number(r.reach || 0)
      if (Array.isArray(r.actions)) {
        r.actions.forEach((a: any) => {
          if (!acc.actions[a.action_type]) acc.actions[a.action_type] = 0
          acc.actions[a.action_type] += Number(a.value || 0)
        })
      }
      return acc
    }, { impressions: 0, clicks: 0, spend: 0, reach: 0, actions: {} as Record<string, number> })

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

    const prompt = `
Você é um analista de mídia sênior. Gere um diagnóstico claro, objetivo e acionável das campanhas de Facebook Ads.
Período: ${datePreset}
Totais: Impressões=${totals.impressions}, Cliques=${totals.clicks}, Gasto=${totals.spend.toFixed(2)}, Alcance=${totals.reach}, CTR=${ctr.toFixed(2)}%, CPC=${cpc.toFixed(2)}, CPM=${cpm.toFixed(2)}.
Ações agregadas: ${Object.entries(totals.actions).map(([k,v]) => `${k}=${v}`).join(", ")}

Regras:
- Destaque 3-5 insights principais (performance, escala, custo, qualidade do tráfego).
- Recomendações práticas para otimizar CTR, CPC, CPM e conversões.
- Liste 3 campanhas com maior potencial de melhoria (se possível), com ações específicas.
- Tom profissional, objetivo e claro, em bullet points.
`

    // Chamada REST para OpenAI
    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ai.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um assistente especialista em mídia paga e análise de performance." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    })

    const aiData = await aiResp.json()
    if (!aiResp.ok) {
      const msg = aiData?.error?.message || `HTTP ${aiResp.status} ${aiResp.statusText}`
      return NextResponse.json({ success: false, error: `Falha na IA: ${msg}` }, { status: 400 })
    }

    const text = aiData.choices?.[0]?.message?.content || "Sem conteúdo."

    return NextResponse.json({
      success: true,
      data: {
        period: datePreset,
        totals,
        ai: text
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}