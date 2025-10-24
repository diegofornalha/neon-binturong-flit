"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatSourceName } from "@/lib/formatters"

interface LeadSourceChartProps {
  data: { source: string; count: number }[]
}

const COLORS = ["#0ea5e9", "#00d4ff", "#06b6d4", "#22d3ee", "#67e8f9"];

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const chartData = data.map(item => ({
    name: formatSourceName(item.source),
    value: item.count,
  }))

  return (
    <Card className="bg-nexus-primary border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-white">Leads por Origem</CardTitle>
        <CardDescription className="text-gray-400">Distribuição dos leads por canal de aquisição.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16213e",
                    borderColor: "rgba(0, 212, 255, 0.2)",
                    color: "#f8fafc",
                  }}
                  formatter={(value: number, name: string) => [`${value} leads`, name]}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {chartData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-center text-gray-400">
            <p>Nenhum dado de origem para exibir no período selecionado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}