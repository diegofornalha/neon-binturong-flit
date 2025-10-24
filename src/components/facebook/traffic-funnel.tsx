"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FunnelData = {
  clicks: number
  lpViews: number
  addToCart: number
  checkouts: number
  purchases: number
  ctr: number
  frequency: number
  cpm: number
}

export function TrafficFunnel({ data }: { data: FunnelData }) {
  const steps = [
    { label: "Cliques", value: data.clicks },
    { label: "Page Views", value: data.lpViews },
    { label: "Add to Cart", value: data.addToCart },
    { label: "Checkouts", value: data.checkouts },
    { label: "Compras", value: data.purchases },
  ]

  const maxVal = Math.max(1, ...steps.map(s => s.value || 0))

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Funil de Tráfego</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel visual */}
          <div className="space-y-3">
            {steps.map((s, idx) => {
              const pct = Math.max(10, Math.round(((s.value || 0) / maxVal) * 100))
              return (
                <div key={idx} className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-medium">{(s.value || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* KPIs laterais */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-muted-foreground">CTR</div>
              <div className="text-lg font-semibold">{data.ctr.toFixed(2)}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Frequência</div>
              <div className="text-lg font-semibold">{data.frequency.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-muted-foreground">CPM</div>
              <div className="text-lg font-semibold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(data.cpm || 0)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}