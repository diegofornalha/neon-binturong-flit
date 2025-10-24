"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useMemo } from "react"
import { getTranslation } from "@/lib/i18n"
import { useLocale } from "@/components/providers/locale-provider"
import { type FacebookMetric } from "@/types/facebook"

interface TopCampaignsTableProps {
  metrics: FacebookMetric[]
}

export function TopCampaignsTable({ metrics }: TopCampaignsTableProps) {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  const topCampaigns = useMemo(() => {
    const agg = new Map<string, {
      campaign_id: string
      campaign_name: string
      spend: number
      clicks: number
      impressions: number
      conversions: number
      cpc: number
      cpm: number
      ctr: number
    }>()

    metrics.forEach((m) => {
      const id = m.campaign_id
      if (!id) return
      const prev = agg.get(id) || { campaign_id: id, campaign_name: m.campaign_name || "-", spend: 0, clicks: 0, impressions: 0, conversions: 0, cpc: 0, cpm: 0, ctr: 0 }
      prev.spend += Number(m.spend || 0)
      prev.clicks += Number(m.clicks || 0)
      prev.impressions += Number(m.impressions || 0)
      if (Array.isArray(m.actions)) {
        m.actions.forEach((act) => {
          if (act.action_type === "lead" || act.action_type === "purchase") {
            prev.conversions += Number(act.value || 0)
          }
        })
      }
      agg.set(id, prev)
    })

    return Array.from(agg.values()).map((c) => {
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0
      const cpc = c.clicks > 0 ? c.spend / c.clicks : 0
      const cpm = c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0
      return { ...c, ctr, cpc, cpm }
    }).sort((a, b) => b.spend - a.spend)
  }, [metrics])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value || 0)
  }
  function formatNumber(value: number) {
    return new Intl.NumberFormat("pt-BR").format(value || 0)
  }

  if (topCampaigns.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('fb.top.campaigns')}</CardTitle>
          <CardDescription>Principais campanhas no período selecionado</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Nenhuma campanha encontrada
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{t('fb.top.campaigns')}</CardTitle>
        <CardDescription>Principais campanhas no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead className="text-right">Impressões</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="text-right">CPM</TableHead>
                <TableHead className="text-right">Conversões</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCampaigns.slice(0, 10).map((c) => (
                <TableRow key={c.campaign_id}>
                  <TableCell className="font-medium">{c.campaign_name}</TableCell>
                  <TableCell className="text-right">{formatNumber(c.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(c.clicks)}</TableCell>
                  <TableCell className="text-right">{c.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.cpc)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.cpm)}</TableCell>
                  <TableCell className="text-right">{formatNumber(c.conversions)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.spend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}