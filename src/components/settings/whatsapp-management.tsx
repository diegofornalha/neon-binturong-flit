"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, Plus, Power, PowerOff, QrCode, Trash2, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppInstance {
  id: string
  instance_name: string
  instance_key: string
  phone?: string
  status: 'connected' | 'disconnected' | 'qrcode' | 'connecting'
  evolution_url: string
  created_at: string
  connected_at?: string
  qr_code?: string
}

export function WhatsAppManagement() {
  const { organization, isSuperAdmin, session } = useAuth()
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null)
  const [formData, setFormData] = useState({
    instance_name: "",
    instance_key: "",
    evolution_url: "",
    evolution_api_key: ""
  })

  // Carregar organizações se for super admin
  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations()
    } else if (organization) {
      setSelectedOrgId(organization.id)
    }
  }, [isSuperAdmin, organization])

  // Carregar instâncias quando organização for selecionada
  useEffect(() => {
    if (selectedOrgId) {
      loadInstances()
    }
  }, [selectedOrgId])

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations/list', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setOrganizations(result.data || [])

      if (result.data && result.data.length > 0 && !selectedOrgId) {
        setSelectedOrgId(result.data[0].id)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error loading organizations:', error)
      toast.error('Erro ao carregar organizações')
    }
  }

  const loadInstances = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/whatsapp/instances?orgId=${selectedOrgId}`)
      const data = await response.json()

      if (data.success) {
        setInstances(data.data || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error loading instances:', error)
      toast.error('Erro ao carregar instâncias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstance = async () => {
    if (!formData.instance_name || !formData.instance_key || !formData.evolution_url || !formData.evolution_api_key) {
      toast.error("Todos os campos são obrigatórios")
      return
    }

    try {
      const response = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: selectedOrgId,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Instância criada com sucesso!')
        setIsDialogOpen(false)
        setFormData({
          instance_name: "",
          instance_key: "",
          evolution_url: "",
          evolution_api_key: ""
        })
        loadInstances()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error creating instance:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar instância')
    }
  }

  const handleConnect = async (instance: WhatsAppInstance) => {
    try {
      toast.loading('Conectando instância...', { id: 'connecting' })

      const response = await fetch('/api/whatsapp/instances/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId: instance.id })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Instância conectada! Escaneie o QR Code', { id: 'connecting' })

        if (data.qrCode) {
          setSelectedInstance({ ...instance, qr_code: data.qrCode })
          setQrDialogOpen(true)
        }

        loadInstances()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error connecting:', error)
      toast.error('Erro ao conectar instância', { id: 'connecting' })
    }
  }

  const handleDisconnect = async (instanceId: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta instância?')) return

    try {
      const response = await fetch(`/api/whatsapp/instances/status?instanceId=${instanceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Instância desconectada')
        loadInstances()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error disconnecting:', error)
      toast.error('Erro ao desconectar instância')
    }
  }

  const handleDelete = async (instanceId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta instância? Esta ação não pode ser desfeita.')) return

    try {
      const response = await fetch(`/api/whatsapp/instances?id=${instanceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Instância deletada')
        loadInstances()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error deleting:', error)
      toast.error('Erro ao deletar instância')
    }
  }

  const handleRefreshStatus = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/instances/status?instanceId=${instanceId}`)
      const data = await response.json()

      if (data.success) {
        toast.success('Status atualizado')
        loadInstances()
      }
    } catch (error) {
      console.error('[WhatsAppManagement] Error refreshing status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: { color: 'bg-green-100 text-green-800', label: 'Conectado' },
      disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Desconectado' },
      qrcode: { color: 'bg-yellow-100 text-yellow-800', label: 'Aguardando QR' },
      connecting: { color: 'bg-blue-100 text-blue-800', label: 'Conectando' }
    }
    const variant = variants[status as keyof typeof variants] || variants.disconnected

    return <Badge className={variant.color}>{variant.label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Instâncias WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie as conexões WhatsApp da sua organização
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Seletor de organização para super admin */}
          {isSuperAdmin && organizations.length > 0 && (
            <div className="mb-6">
              <Label>Organização</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma organização" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {instances.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma instância WhatsApp configurada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.instance_name}</TableCell>
                    <TableCell>{instance.phone || '-'}</TableCell>
                    <TableCell>{getStatusBadge(instance.status)}</TableCell>
                    <TableCell>{new Date(instance.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefreshStatus(instance.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>

                        {instance.status === 'connected' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(instance.id)}
                          >
                            <PowerOff className="h-4 w-4 mr-1" />
                            Desconectar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConnect(instance)}
                          >
                            <Power className="h-4 w-4 mr-1" />
                            Conectar
                          </Button>
                        )}

                        {instance.qr_code && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInstance(instance)
                              setQrDialogOpen(true)
                            }}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(instance.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Instância */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Instância WhatsApp</DialogTitle>
            <DialogDescription>
              Configure uma nova conexão WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome da Instância</Label>
              <Input
                placeholder="Ex: Vendas, Suporte, Marketing"
                value={formData.instance_name}
                onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Chave da Instância</Label>
              <Input
                placeholder="Ex: vendas_001"
                value={formData.instance_key}
                onChange={(e) => setFormData({ ...formData, instance_key: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Chave única sem espaços ou caracteres especiais
              </p>
            </div>

            <div>
              <Label>URL da Evolution API</Label>
              <Input
                placeholder="https://api.evolution.com"
                value={formData.evolution_url}
                onChange={(e) => setFormData({ ...formData, evolution_url: e.target.value })}
              />
            </div>

            <div>
              <Label>API Key da Evolution</Label>
              <Input
                type="password"
                placeholder="Sua chave de API"
                value={formData.evolution_api_key}
                onChange={(e) => setFormData({ ...formData, evolution_api_key: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInstance}>
              Criar Instância
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {selectedInstance?.instance_name}</DialogTitle>
            <DialogDescription>
              Escaneie este QR Code no WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            {selectedInstance?.qr_code ? (
              <img
                src={selectedInstance.qr_code}
                alt="QR Code"
                className="w-64 h-64"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                Aguardando QR Code...
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setQrDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
