"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatFunnelStageName } from "@/lib/formatters"

interface FunnelStageChartProps {
  data: { funnelStage: string; count: number }[]
}

export function FunnelStageChart({ data }: FunnelStageChartProps) {
  const chartData = data.map(item => ({
    name: formatFunnelStageName(item.funnelStage),
    Leads: item.count,
  }))

  return (
    <Card className="bg-nexus-primary border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-white">Leads por Etapa de Funil</CardTitle>
        <CardDescription className="text-gray-400">Distribuição dos leads nas etapas do funil de vendas.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#16213e",
                  borderColor: "rgba(0, 212, 255, 0.2)",
                  color: "#f8fafc",
                }}
                formatter={(value: number) => [`${value} leads`, 'Total']}
              />
              <Bar dataKey="Leads" fill="url(#colorFunnel)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-center text-gray-400">
            <p>Nenhum dado de funil para exibir no período selecionado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}