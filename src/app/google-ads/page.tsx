"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap } from "lucide-react"

export default function GoogleAdsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Google Ads</h1>
          <p className="text-muted-foreground">Analise a performance das suas campanhas de Google Ads</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Página em Construção</CardTitle>
          <CardDescription>
            Esta funcionalidade de métricas do Google Ads está sendo desenvolvida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
          <Zap className="h-16 w-16 mb-4" />
          <p>Em breve você poderá visualizar os dados de suas campanhas do Google Ads aqui.</p>
        </CardContent>
      </Card>
    </div>
  )
}