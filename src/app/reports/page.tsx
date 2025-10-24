"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReportGenerator } from '@/components/reports/report-generator'
import { supabase } from '@/integrations/supabase/client'
import { DEFAULT_ORGANIZATION_ID } from '@/lib/organization'
import { Loader2, FileText } from 'lucide-react'

export default function ReportsPage() {
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name')
          .eq('organization_id', DEFAULT_ORGANIZATION_ID)

        if (error) throw error

        setClients(data || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Gere relatórios white-label em PDF para seus clientes</p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Gerenciar Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportGenerator clients={clients} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Agendados</CardTitle>
            <CardDescription>
              Configure envios automáticos para seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Em breve.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}