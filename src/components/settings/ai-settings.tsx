"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function AISettings() {
  const [apiKey, setApiKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/settings/ai")
        const data = await resp.json()
        if (data.success && data.data?.apiKey) {
          setApiKey(data.data.apiKey)
        }
      } catch (e) {
        console.error("[AISettings] load error", e)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const resp = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "openai", apiKey })
      })
      const data = await resp.json()
      if (!resp.ok || !data.success) throw new Error(data.error || "Falha ao salvar")
      toast.success("Chave de IA salva com sucesso")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const resp = await fetch("/api/ai/analyze-campaigns?date_preset=last_7d")
      const data = await resp.json()
      if (!data.success) throw new Error(data.error || "Falha no teste")
      toast.success("Análise gerada com sucesso (veja na aba de IA da página Facebook Ads)")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no teste")
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IA e Análises</CardTitle>
        <CardDescription>
          Configure sua chave de API para habilitar análises inteligentes de campanhas, recomendações e relatórios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-key">OpenAI API Key</Label>
          <Input
            id="ai-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !apiKey}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? "Testando..." : "Testar Análise"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}