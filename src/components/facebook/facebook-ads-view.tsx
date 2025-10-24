"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RefreshCw, Settings, TriangleAlert, Users, MapPin, Image as ImageIcon, Sparkles } from "lucide-react"
import { FacebookKPIs } from "./facebook-kpis"
import { MainCharts } from "./main-charts"
import { BreakdownCharts } from "./breakdown-charts"
import { TopCampaignsTable } from "./top-campaigns-table"
import { MetricsFilters } from "./metrics-filters"
import { DemographicsCharts } from "./demographics-charts"
import { AdsGallery } from "./ads-gallery"
import { useLocale } from "@/components/providers/locale-provider"
import { getTranslation } from "@/lib/i18n"
import { useFacebookData } from "@/hooks/use-facebook-data"
import { ExportControls } from "@/components/reports/export-controls"
import { TrafficFunnel } from "./traffic-funnel"
import { AIAnalysis } from "./ai-analysis"
import type { FacebookMetric } from "@/types/facebook"

type Preset = "last_7d" | "last_30d" | "last_90d"

export default function FacebookAdsView() {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  const [preset, setPreset] = useState<Preset>("last_30d")
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [selectedAdSetIds, setSelectedAdSetIds] = useState<string[]>([])
  
  const {
    campaigns,
    metrics,
    breakdownData,
    loading,
    error,
    lastUpdated,
    isConfigured,
    refetch
  } = useFacebookData(preset, selectedCampaignIds, selectedAdSetIds)

  const [demographics, setDemographics] = useState<{
    gender: any[]
    age: any[]
    country: any[]
    region: any[]
  }>({ gender: [], age: [], country: [], region: [] })

  // Calculate stats for AIAnalysis - SEMPRE executar, não usar early return
  const stats = useMemo(() => {
    let impressions = 0, clicks = 0, spend = 0, conversions = 0, engagements = 0
    let actions: any[] = []

    metrics.forEach((m: any) => {
      impressions += Number(m.impressions || 0)
      clicks += Number(m.clicks || 0)
      spend += Number(m.spend || 0)
      engagements += Number(m.engagement || 0)
      if (m.conversions) conversions += Number(m.conversions || 0)
      if (m.actions) actions.push(...m.actions)
    })

    const purchaseValue = actions.reduce((sum, a: any) => {
      if (a.action_type === 'purchase') return sum + Number(a.value || 0)
      return sum
    }, 0)

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
    const roas = spend > 0 ? purchaseValue / spend : 0
    const costPerConversion = conversions > 0 ? spend / conversions : 0
    const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0

    return {
      impressions,
      clicks,
      spend,
      ctr,
      cpc,
      cpm,
      roas,
      costPerConversion,
      engagementRate,
      avgQuality: 0,
      conversions
    }
  }, [metrics])

  const funnelData = useMemo(() => {
    let clicks = 0, impressions = 0, spend = 0, lpViews = 0, addToCart = 0, checkouts = 0, purchases = 0, freqAcc = 0, freqCount = 0
    metrics.forEach((m: any) => {
      clicks += Number(m.clicks || 0)
      impressions += Number(m.impressions || 0)
      spend += Number(m.spend || 0)
      if (Number(m.frequency || 0) > 0) { freqAcc += Number(m.frequency); freqCount++ }
      if (Array.isArray(m.actions)) {
        m.actions.forEach((a: any) => {
          const type = String(a.action_type || "").toLowerCase()
          const val = Number(a.value || 0)
          if (type.includes('landing_page_view')) lpViews += val
          if (type.includes('add_to_cart')) addToCart += val
          if (type.includes('initiate_checkout')) checkouts += val
          if (type.includes('purchase')) purchases += val
        })
      }
    })
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const frequency = freqCount > 0 ? (freqAcc / freqCount) : 0
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
    return { clicks, lpViews, addToCart, checkouts, purchases, ctr, frequency, cpm }
  }, [metrics])

  const seriesByDay = useMemo(() => {
    const map = new Map<string, any>()
    metrics.forEach((m: any) => {
      const date = m.date_start
      const prev = map.get(date) || { date, spend: 0, clicks: 0, impressions: 0, ctr: 0, cpc: 0, cpm: 0 }
      prev.spend += Number(m.spend || 0)
      prev.clicks += Number(m.clicks || 0)
      prev.impressions += Number(m.impressions || 0)
      map.set(date, prev)
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [metrics])

  useEffect(() => {
    if (!isConfigured) return

    const qsCampaign = selectedCampaignIds.length ? `&campaignIds=${selectedCampaignIds.join(",")}` : ""
    const qsAdset = selectedAdSetIds.length ? `&adsetIds=${selectedAdSetIds.join(",")}` : ""

    const loadDemographics = async () => {
      try {
        const response = await fetch(`/api/facebook/demographics?date_preset=${preset}${qsCampaign}${qsAdset}`)
        const data = await response.json()
        
        if (data.success) {
          setDemographics(data.data)
        }
      } catch (e) {
        console.error("Erro ao carregar demografia:", e)
      }
    }
    
    loadDemographics()
  }, [preset, selectedCampaignIds, selectedAdSetIds, isConfigured])

  const clearFilters = () => {
    setSelectedCampaignIds([])
    setSelectedAdSetIds([])
  }

  // IMPORTANTE: Não usar early return antes de todos os hooks
  // Renderizar conteúdo condicional DEPOIS de todos os hooks
  
  return (
    <div className="space-y-8">
      {!isConfigured ? (
        <div className="py-16 text-center space-y-4">
          <TriangleAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Facebook Ads não configurado</h2>
          <p className="text-muted-foreground">Vá em Configurações → Facebook Ads para salvar o Access Token.</p>
          <Button onClick={() => (window.location.href = "/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Facebook Ads
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Facebook Ads Dashboard</h1>
              <p className="text-muted-foreground">
                Atualizado: {lastUpdated || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportControls data={metrics} filename={`facebook_metrics_${preset}.csv`} />
              <div className="flex rounded-lg overflow-hidden border">
                {(["last_7d","last_30d","last_90d"] as Preset[]).map((p) => (
                  <Button key={p} variant={preset === p ? "default" : "ghost"} onClick={() => setPreset(p)} className="rounded-none">
                    {p.replace("last_", "")}
                  </Button>
                ))}
              </div>
              <Button onClick={() => refetch()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="demographics">
                <Users className="h-4 w-4 mr-2" />
                Demografia
              </TabsTrigger>
              <TabsTrigger value="creatives">
                <ImageIcon className="h-4 w-4 mr-2" />
                Criativos
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-2" />
                Análise IA
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <MetricsFilters
                campaigns={campaigns}
                adSets={[]}
                selectedCampaignIds={selectedCampaignIds}
                setSelectedCampaignIds={setSelectedCampaignIds}
                selectedAdSetIds={selectedAdSetIds}
                setSelectedAdSetIds={setSelectedAdSetIds}
                onClear={clearFilters}
              />

              <FacebookKPIs metrics={metrics} />
              
              <MainCharts seriesByDay={seriesByDay} />

              <BreakdownCharts breakdownData={breakdownData} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TrafficFunnel data={funnelData} />
                <TopCampaignsTable metrics={metrics} />
              </div>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics" className="space-y-6">
              <DemographicsCharts
                gender={demographics.gender}
                age={demographics.age}
                country={demographics.country}
                region={demographics.region}
              />
            </TabsContent>

            {/* Creatives Tab */}
            <TabsContent value="creatives">
              <AdsGallery />
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai">
              <AIAnalysis metrics={stats} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}