"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, Eye, MousePointer, DollarSign } from "lucide-react"

export default function CampaignsPage() {
  // Mock data de campanhas
  const campaigns = [
    {
      id: 1,
      name: "Black Friday 2025",
      status: "active",
      platform: "Facebook",
      budget: 5000,
      spent: 3245.50,
      impressions: 125430,
      clicks: 3250,
      conversions: 127,
      ctr: 2.59,
      cpc: 0.99,
      trend: "up"
    },
    {
      id: 2,
      name: "Google Search - Verão",
      status: "active",
      platform: "Google",
      budget: 3000,
      spent: 2150.75,
      impressions: 89200,
      clicks: 2180,
      conversions: 89,
      ctr: 2.44,
      cpc: 0.98,
      trend: "up"
    },
    {
      id: 3,
      name: "Instagram Stories - Produto X",
      status: "paused",
      platform: "Instagram",
      budget: 2000,
      spent: 450.00,
      impressions: 45200,
      clicks: 890,
      conversions: 12,
      ctr: 1.97,
      cpc: 0.50,
      trend: "down"
    },
    {
      id: 4,
      name: "Remarketing - Carrinhos Abandonados",
      status: "active",
      platform: "Facebook",
      budget: 1500,
      spent: 1234.80,
      impressions: 67800,
      clicks: 1560,
      conversions: 78,
      ctr: 2.30,
      cpc: 0.79,
      trend: "up"
    }
  ]

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  const avgCTR = (totalClicks / totalImpressions * 100).toFixed(2)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie todas as suas campanhas de tráfego pago
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* KPIs Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orçamento Total</CardDescription>
            <CardTitle className="text-2xl">
              R$ {totalBudget.toLocaleString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Impressões</CardDescription>
            <CardTitle className="text-2xl">
              {totalImpressions.toLocaleString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cliques</CardDescription>
            <CardTitle className="text-2xl">
              {totalClicks.toLocaleString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MousePointer className="h-3 w-3" />
              CTR: {avgCTR}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversões</CardDescription>
            <CardTitle className="text-2xl">
              {totalConversions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              De {campaigns.length} campanhas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Campanhas ({campaigns.length})</CardTitle>
          <CardDescription>
            Visão geral de performance de todas as campanhas ativas e pausadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                    </Badge>
                    <Badge variant="outline">{campaign.platform}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Orçamento</p>
                      <p className="font-medium">R$ {campaign.budget.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gasto</p>
                      <p className="font-medium">R$ {campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impressões</p>
                      <p className="font-medium">{campaign.impressions.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cliques</p>
                      <p className="font-medium">{campaign.clicks.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium flex items-center gap-1">
                        {campaign.ctr}%
                        {campaign.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
