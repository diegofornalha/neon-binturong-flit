"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { getTranslation } from "@/lib/i18n"
import { useLocale } from "@/components/providers/locale-provider"

interface BreakdownChartsProps {
  breakdownData: { byPlatform: any[]; byDevice: any[] }
}

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#0ea5e9", "#ef4444", "#8b5cf6", "#84cc16", "#06b6d4"]

export function BreakdownCharts({ breakdownData }: BreakdownChartsProps) {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  const platformSpend = useMemo(() => {
    const agg = new Map<string, number>()
    breakdownData.byPlatform.forEach(item => {
      const current = agg.get(item.publisher_platform) || 0
      agg.set(item.publisher_platform, current + parseFloat(item.spend))
    })
    return Array.from(agg.entries()).map(([name, value]) => ({ name, value }))
  }, [breakdownData.byPlatform])

  const deviceData = useMemo(() => {
    const agg = new Map<string, number>()
    breakdownData.byDevice.forEach(item => {
      const current = agg.get(item.device_platform) || 0
      agg.set(item.device_platform, current + parseFloat(item.spend))
    })
    return Array.from(agg.entries()).map(([name, value]) => ({ name, value }))
  }, [breakdownData.byDevice])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value || 0)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('fb.chart.byPlatform')}</CardTitle>
          <CardDescription>Gasto por plataforma de publicação</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformSpend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={t('fb.kpi.spend')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('fb.chart.byDevice')}</CardTitle>
          <CardDescription>Gasto por tipo de dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name={t('fb.kpi.spend')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}