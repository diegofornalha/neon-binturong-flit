"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface DemographicsChartsProps {
  gender: { name: string; clicks: number; impressions: number; spend: number }[]
  age: { name: string; clicks: number; impressions: number; spend: number }[]
  country: { name: string; clicks: number; impressions: number; spend: number }[]
  region: { name: string; clicks: number; impressions: number; spend: number; reach: number }[]
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function DemographicsCharts({ gender, age, country, region }: DemographicsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value || 0)
  }

  const topCountries = country.sort((a, b) => b.clicks - a.clicks).slice(0, 8)
  const topRegions = region.sort((a, b) => b.clicks - a.clicks).slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Gender & Age */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
            <CardDescription>Cliques por gênero do público</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gender}
                  dataKey="clicks"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} cliques`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição por Faixa Etária</CardTitle>
            <CardDescription>Cliques por idade do público</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={age}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} cliques`} />
                <Legend />
                <Bar dataKey="clicks" fill="#3b82f6" name="Cliques" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Countries */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Top Países por Performance</CardTitle>
          <CardDescription>Países com maior volume de cliques e investimento</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCountries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'spend') return formatCurrency(Number(value))
                  return value
                }}
              />
              <Legend />
              <Bar dataKey="clicks" fill="#3b82f6" name="Cliques" />
              <Bar dataKey="spend" fill="#22c55e" name="Gasto" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Top Regiões/Cidades</CardTitle>
          <CardDescription>Regiões com maior engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Região</th>
                  <th className="text-right py-3 px-4">Cliques</th>
                  <th className="text-right py-3 px-4">Impressões</th>
                  <th className="text-right py-3 px-4">Alcance</th>
                  <th className="text-right py-3 px-4">Gasto</th>
                  <th className="text-right py-3 px-4">CTR</th>
                </tr>
              </thead>
              <tbody>
                {topRegions.map((r, idx) => {
                  const ctr = r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0
                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{r.name}</td>
                      <td className="text-right py-3 px-4">{r.clicks.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-3 px-4">{r.impressions.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-3 px-4">{r.reach.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(r.spend)}</td>
                      <td className="text-right py-3 px-4">{ctr.toFixed(2)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}