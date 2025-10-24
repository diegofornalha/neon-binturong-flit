"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { getTranslation } from "@/lib/i18n"
import { useLocale } from "@/components/providers/locale-provider"

interface MainChartsProps {
  seriesByDay: { date: string; spend: number; clicks: number; impressions: number; ctr: number; cpc: number; cpm: number }[]
}

export function MainCharts({ seriesByDay }: MainChartsProps) {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value || 0)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('fb.chart.spendByDay')}</CardTitle>
          <CardDescription>Distribuição diária de investimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seriesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="spend" stroke="#0ea5e9" name={t('fb.kpi.spend')} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('fb.chart.impressionsVsClicks')}</CardTitle>
          <CardDescription>Série temporal de alcance e interação</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={seriesByDay}>
              <defs>
                <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="impressions" stroke="#6366f1" fill="url(#colorImp)" name={t('fb.kpi.impressions')} />
              <Area type="monotone" dataKey="clicks" stroke="#22c55e" fill="url(#colorClk)" name={t('fb.kpi.clicks')} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}