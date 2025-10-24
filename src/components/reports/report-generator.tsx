"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { generateReportPDF } from '@/lib/report-generator'
import { toast } from 'sonner'

interface ReportGeneratorProps {
  clients: Array<{
    id: string
    name: string
  }>
}

export function ReportGenerator({ clients }: ReportGeneratorProps) {
  const [selectedClient, setSelectedClient] = useState('')
  const [period, setPeriod] = useState({
    from: new Date(),
    to: new Date(),
  })
  const [template, setTemplate] = useState('executive')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          period: {
            start: format(period.from, 'yyyy-MM-dd'),
            end: format(period.to, 'yyyy-MM-dd'),
          },
          template,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao gerar relatório')
      }

      const blob = await generateReportPDF(data.data)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-${data.data.client.name}-${format(period.from, 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Relatório gerado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerador de Relatórios</CardTitle>
        <CardDescription>
          Crie relatórios personalizados para seus clientes com branding white-label
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="sr-only">De</Label>
                <Select value={format(period.from, 'yyyy-MM-dd')} onValueChange={(value) => {
                  setPeriod(prev => ({ ...prev, from: new Date(value) }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="De" />
                  </SelectTrigger>
                  <SelectContent>
                    {[7, 14, 30, 90].map(days => (
                      <SelectItem key={days} value={format(new Date(Date.now() - days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}>
                        {days} dias atrás
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="sr-only">Até</Label>
                <Select value={format(period.to, 'yyyy-MM-dd')} onValueChange={(value) => {
                  setPeriod(prev => ({ ...prev, to: new Date(value) }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Até" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={format(new Date(), 'yyyy-MM-dd')}>
                      Hoje
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive">Executivo (1 página)</SelectItem>
              <SelectItem value="detailed">Detalhado (3-5 páginas)</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? 'Gerando...' : 'Gerar Relatório PDF'}
        </Button>
      </CardContent>
    </Card>
  )
}