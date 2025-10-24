"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RegionRow = { region: string; clicks: number; impressions: number; spend: number }

export function GeoBreakdown({ regions }: { regions: RegionRow[] }) {
  const top = (regions || []).slice(0, 12)

  const currency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(n || 0)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Regiões com mais cliques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Região</th>
                <th className="py-2 pr-4">Cliques</th>
                <th className="py-2 pr-4">Impressões</th>
                <th className="py-2 pr-4">Gasto</th>
                <th className="py-2">Mapa</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r, i) => (
                <tr key={`${r.region}-${i}`} className="border-t">
                  <td className="py-2 pr-4">{r.region}</td>
                  <td className="py-2 pr-4">{r.clicks.toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-4">{r.impressions.toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-4">{currency(r.spend)}</td>
                  <td className="py-2">
                    <a
                      className="text-blue-600 underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.region)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver mapa
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {top.length === 0 && <div className="text-sm text-muted-foreground">Sem dados para o período</div>}
        </div>
      </CardContent>
    </Card>
  )
}