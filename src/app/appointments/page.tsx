"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Mail, Phone, Clock, CheckCircle, XCircle, Repeat, Car } from "lucide-react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Interface para a estrutura de dados que a API retorna
interface AppointmentData {
  appointment: {
    id: number;
    veiculo: string | null;
    data_agendamento: string;
    status: 'PENDENTE' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO' | 'REAGENDADO';
    cliente_nome: string;
    cliente_telefone: string | null;
  };
  lead: {
    id: number;
    nome_completo: string;
    email: string;
    origem: string;
  } | null;
  vendedor: {
    id: number;
    nome: string;
  } | null;
}

const KANBAN_COLUMNS: AppointmentData['appointment']['status'][] = ['PENDENTE', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'REAGENDADO'];

const STATUS_META = {
  PENDENTE: { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500' },
  CONFIRMADO: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-500' },
  REALIZADO: { icon: <CheckCircle className="h-4 w-4 text-green-700" />, color: 'bg-green-200' },
  CANCELADO: { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500' },
  REAGENDADO: { icon: <Repeat className="h-4 w-4" />, color: 'bg-orange-500' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        const response = await fetch('/api/appointments')
        const data = await response.json()
        if (!response.ok) throw new Error('Falha ao carregar agendamentos')
        setAppointments(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [])

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(a => a.appointment.status === status);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kanban de Agendamentos</h1>
        <p className="text-muted-foreground">Gerencie o fluxo dos seus agendamentos de forma visual</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
        {KANBAN_COLUMNS.map(status => (
          <div key={status} className="bg-card/50 rounded-lg p-3 md:p-4 flex flex-col min-w-[280px] md:min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS_META[status]?.color || 'bg-gray-500'}`} />
                <h2 className="font-bold capitalize">{status.toLowerCase()}</h2>
              </div>
              <Badge variant="secondary">{getAppointmentsByStatus(status).length}</Badge>
            </div>
            <div className="space-y-4 overflow-y-auto">
              {getAppointmentsByStatus(status).map(({ appointment, lead, vendedor }) => (
                <Dialog key={appointment.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background">
                      <CardContent className="p-4 text-sm">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold mb-2 pr-4">{appointment.cliente_nome}</p>
                          <Badge variant="outline">{vendedor?.nome || 'N/A'}</Badge>
                        </div>
                        <div className="text-muted-foreground space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span>{appointment.veiculo || 'Veículo não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(appointment.data_agendamento).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{appointment.veiculo || 'Agendamento'}</DialogTitle>
                      <DialogDescription>
                        Agendado para {new Date(appointment.data_agendamento).toLocaleString('pt-BR')}
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <strong>Nome:</strong> {appointment.cliente_nome}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <strong>Email:</strong> {lead?.email || 'Não informado'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <strong>Telefone:</strong> {appointment.cliente_telefone || 'Não informado'}</p>
                      </div>
                      <h3 className="font-semibold mt-4 mb-2">Vendedor Responsável</h3>
                      <p>{vendedor?.nome || 'Não atribuído'}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}