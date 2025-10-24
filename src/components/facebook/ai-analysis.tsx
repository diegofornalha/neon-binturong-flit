"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface AIAnalysisProps {
  metrics: {
    impressions: number
    clicks: number
    spend: number
    ctr: number
    cpc: number
    cpm: number
    roas: number
    costPerConversion: number
    engagementRate: number
    avgQuality: number
    conversions: number
  }
}

export function AIAnalysis({ metrics }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState("")

  const handleAnalyze = async () => {
    setLoading(true)
    setAnalysis("")
    
    try {
      const response = await fetch("/api/ai/analyze-campaigns?date_preset=last_30d")
      const data = await response.json()
      
      if (data.success) {
        setAnalysis(data.data.ai)
        toast.success("Análise gerada com sucesso!")
      } else {
        toast.error(data.error || "Erro ao gerar análise")
      }
    } catch (error) {
      console.error("[AIAnalysis] Error:", error)
      toast.error("Erro ao gerar análise")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Análise Inteligente por IA
            </CardTitle>
            <CardDescription>
              Insights e recomendações geradas automaticamente
            </CardDescription>
          </div>
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Análise
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {analysis}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Clique em "Gerar Análise" para obter insights inteligentes sobre suas campanhas</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}