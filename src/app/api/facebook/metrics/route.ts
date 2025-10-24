import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook API][metrics] Iniciando fetch de insights')

    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get('date_preset') || 'last_30d'
    const timeIncrement = searchParams.get('time_increment') || '1'
    const campaignIdsParam = searchParams.get('campaignIds') // Novo filtro
    const adsetIdsParam = searchParams.get('adsetIds')     // Novo filtro

    const db = await getDb()
    const settings = db.data.settings?.facebook

    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado. Salve o Access Token em Configurações.' }, { status: 400 })
    }

    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = settings.accessToken
    const baseUrl = 'https://graph.facebook.com/v18.0'

    const fields = [
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_id',
      'ad_name',
      'impressions',
      'clicks',
      'spend',
      'actions',
      'reach',
      'frequency',
      'ctr',
      'cpc',
      'cpm',
      'cpp',
      'date_start',
      'date_stop'
    ].join(',')

    let url = `${baseUrl}/act_${accountId}/insights?fields=${fields}&date_preset=${encodeURIComponent(
      datePreset
    )}&time_increment=${encodeURIComponent(timeIncrement)}&access_token=${encodeURIComponent(accessToken)}`

    // Adicionar filtros de campanha e adset à URL da API do Facebook
    const filtering: any[] = []
    if (campaignIdsParam) {
      filtering.push({ field: 'campaign.id', operator: 'IN', value: campaignIdsParam.split(',') })
    }
    if (adsetIdsParam) {
      filtering.push({ field: 'adset.id', operator: 'IN', value: adsetIdsParam.split(',') })
    }
    if (filtering.length > 0) {
      url += `&filtering=${encodeURIComponent(JSON.stringify(filtering))}`
    }

    console.log('[Facebook API][metrics] URL construída (segredo oculto):', url.replace(accessToken, '***TOKEN***'))

    const resp = await fetch(url)
    const data = await resp.json()

    if (!resp.ok || data.error) {
      const message = data?.error?.message || `HTTP ${resp.status} ${resp.statusText}`
      console.error('[Facebook API][metrics] Erro:', message)
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    console.log(`[Facebook API][metrics] Sucesso - ${data.data?.length || 0} linhas`)
    return NextResponse.json({ success: true, data: data.data || [] })
  } catch (e) {
    console.error('[Facebook API][metrics] Falha inesperada:', e)
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}