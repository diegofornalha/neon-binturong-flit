"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

type DonutDatum = { name: string; value: number }

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export function DonutChart({ title, data }: { title: string; data: DonutDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const safeData = data.map((d) => ({ ...d, value: Number(d.value || 0) }))

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={safeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => [v, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-xs text-muted-foreground mt-2">Total: {total.toLocaleString("pt-BR")}</div>
      </CardContent>
    </Card>
  )
}