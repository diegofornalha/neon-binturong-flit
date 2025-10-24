"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Loader2, Users, TrendingUp, AlertTriangle, Thermometer, ThermometerSnowflake, ThermometerSun } from "lucide-react"
import { toast } from "sonner"
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart"
import { FunnelStageChart } from "@/components/dashboard/funnel-stage-chart"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { formatSourceName } from "@/lib/formatters"
import { LeadListDialog } from "@/components/dashboard/lead-list-dialog"

type Preset = "today" | "7d" | "30d" | "custom"

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState<Preset>("30d")
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    dateRange: DateRange | undefined,
    origem: string,
    status: string,
  }>({
    dateRange: { from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() },
    origem: 'all',
    status: 'all',
  })

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.dateRange?.from) params.append('startDate', filters.dateRange.from.toISOString())
        if (filters.dateRange?.to) params.append('endDate', filters.dateRange.to.toISOString())
        if (filters.origem !== 'all') params.append('origem', filters.origem)
        if (filters.status !== 'all') params.append('status', filters.status)

        const response = await fetch(`/api/dashboard/overview?${params.toString()}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Falha ao carregar dados do dashboard')
        
        setOverview(data.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    loadOverview()
  }, [filters])

  const handlePresetChange = (newPreset: Preset) => {
    setPreset(newPreset)
    const to = new Date()
    let from: Date
    if (newPreset === 'today') {
      from = new Date()
      from.setHours(0, 0, 0, 0)
    } else if (newPreset === '7d') {
      from = new Date(new Date().setDate(to.getDate() - 7))
    } else {
      from = new Date(new Date().setDate(to.getDate() - 30))
    }
    setFilters(prev => ({ ...prev, dateRange: { from, to } }))
  }

  const filterOptions = overview?.filters || { origins: [], statuses: [] };

  const funnelCards = [
    { title: "Leads Frios", value: overview?.funnelStats?.frio ?? 0, icon: <ThermometerSnowflake className="h-4 w-4 text-blue-400" />, stage: 'lead_frio' },
    { title: "Leads Mornos", value: overview?.funnelStats?.morno ?? 0, icon: <Thermometer className="h-4 w-4 text-orange-400" />, stage: 'lead_morno' },
    { title: "Leads Quentes", value: overview?.funnelStats?.quente ?? 0, icon: <ThermometerSun className="h-4 w-4 text-red-400" />, stage: 'lead_quente' },
    { title: "Desqualificados", value: overview?.funnelStats?.desqualificado ?? 0, icon: <AlertTriangle className="h-4 w-4 text-gray-400" />, stage: 'lead_desqualificado' },
  ]

  return (
    <>
      <div className="space-y-6 p-6 bg-nexus-darker text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400">Resumo de performance para o cliente Bonanza.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-cyan-500/20">
              {(["today", "7d", "30d"] as Preset[]).map((p) => (
                <Button key={p} variant={preset === p ? "default" : "ghost"} onClick={() => handlePresetChange(p)} className="rounded-none bg-nexus-primary hover:bg-nexus-secondary data-[state=active]:bg-nexus-blue">
                  {p === 'today' ? 'Hoje' : `${p.replace('d', '')} dias`}
                </Button>
              ))}
            </div>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(date) => {
                setFilters(prev => ({ ...prev, dateRange: date }))
                setPreset('custom')
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {funnelCards.map(card => (
                <Card 
                  key={card.title} 
                  className="bg-nexus-primary border-cyan-500/20 cursor-pointer hover:border-nexus-cyan transition-all"
                  onClick={() => setSelectedStage(card.stage)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{card.value}</div>
                    <p className="text-xs text-gray-400">
                      {overview?.totalLeads > 0 ? `${((card.value / overview.totalLeads) * 100).toFixed(1)}% do total` : ` `}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <LeadSourceChart data={overview?.leadsBySource || []} />
              <FunnelStageChart data={overview?.leadsByFunnel || []} />
            </div>
          </>
        )}
      </div>
      <LeadListDialog 
        stage={selectedStage}
        open={!!selectedStage}
        onOpenChange={() => setSelectedStage(null)}
      />
    </>
  )
}