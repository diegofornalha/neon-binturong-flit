"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Eye, MousePointer, DollarSign, TrendingUp, Percent, ArrowRightLeft, Users, Clock, Target } from "lucide-react"
import { useMemo } from "react"
import { getTranslation } from "@/lib/i18n"
import { useLocale } from "@/components/providers/locale-provider"
import { type FacebookMetric } from "@/types/facebook"

interface FacebookKPIsProps {
  metrics: FacebookMetric[]
}

export function FacebookKPIs({ metrics }: FacebookKPIsProps) {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  const stats = useMemo(() => {
    let impressions = 0, clicks = 0, spend = 0, conversions = 0, reach = 0
    let freqAccum = 0, freqCount = 0
    let cppAccum = 0, cppCount = 0

    metrics.forEach((m) => {
      impressions += Number(m.impressions || 0)
      clicks += Number(m.clicks || 0)
      spend += Number(m.spend || 0)
      reach += Number(m.reach || 0)
      freqAccum += Number(m.frequency || 0)
      if (Number(m.frequency || 0) > 0) freqCount++
      cppAccum += Number((m as any).cpp || 0)
      if (Number((m as any).cpp || 0) > 0) cppCount++

      if (Array.isArray(m.actions)) {
        m.actions.forEach((act) => {
          if (act.action_type === "lead" || act.action_type === "purchase") {
            conversions += Number(act.value || 0)
          }
        })
      }
    })

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
    const freqAvg = freqCount > 0 ? freqAccum / freqCount : 0
    const cppAvg = cppCount > 0 ? cppAccum / cppCount : 0
    const cpaAvg = conversions > 0 ? spend / conversions : 0

    return {
      totalImpressions: impressions,
      totalClicks: clicks,
      totalSpend: spend,
      totalConversions: conversions,
      totalReach: reach,
      avgFrequency: freqAvg,
      avgCTR: ctr,
      avgCPC: cpc,
      avgCPM: cpm,
      avgCPP: cppAvg,
      avgCPA: cpaAvg,
    }
  }, [metrics])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value || 0)
  }
  function formatNumber(value: number) {
    return new Intl.NumberFormat("pt-BR").format(value || 0)
  }

  const kpiCards = [
    { title: t('fb.kpi.impressions'), value: formatNumber(stats.totalImpressions), icon: <Eye className="text-nexus-blue" /> },
    { title: t('fb.kpi.clicks'), value: formatNumber(stats.totalClicks), icon: <MousePointer className="text-nexus-cyan" /> },
    { title: t('fb.kpi.spend'), value: formatCurrency(stats.totalSpend), icon: <DollarSign className="text-orange-400" /> },
    { title: t('fb.kpi.ctr'), value: `${stats.avgCTR.toFixed(2)}%`, icon: <Percent className="text-sky-400" /> },
    { title: t('fb.kpi.cpc'), value: formatCurrency(stats.avgCPC), icon: <ArrowRightLeft className="text-emerald-400" /> },
    { title: t('fb.kpi.cpm'), value: formatCurrency(stats.avgCPM), icon: <ArrowRightLeft className="text-amber-400 rotate-90" /> },
    { title: t('fb.kpi.reach'), value: formatNumber(stats.totalReach), icon: <Users className="text-indigo-400" /> },
    { title: t('fb.kpi.frequency'), value: `${stats.avgFrequency.toFixed(2)}x`, icon: <Clock className="text-rose-400" /> },
    { title: t('fb.kpi.conversions'), value: formatNumber(stats.totalConversions), icon: <TrendingUp className="text-lime-400" /> },
    { title: t('fb.kpi.cpa'), value: formatCurrency(stats.avgCPA), icon: <Target className="text-teal-400" /> },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="bg-nexus-primary border-cyan-500/20 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-nexus-secondary rounded-lg">
                {kpi.icon}
              </div>
              <div>
                <p className="text-sm text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}