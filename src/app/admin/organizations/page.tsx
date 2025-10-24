"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Pencil, Trash2, Users, Shield } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  created_at: string
  _count?: {
    users: number
    clients: number
  }
}

export default function OrganizationsPage() {
  const { isSuperAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
    status: 'active' as 'active' | 'suspended' | 'cancelled',
    ownerEmail: '',
    ownerName: ''
  })

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      router.push('/dashboard')
      toast.error('Acesso negado. Apenas super admins podem acessar esta página.')
    }
  }, [isSuperAdmin, isLoading, router])

  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations()
    }
  }, [isSuperAdmin])

  const loadOrganizations = async () => {
    try {
      setLoading(true)

      // Obter token da sessão atual
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      // Usar API para evitar recursão RLS
      const response = await fetch('/api/organizations/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar organizações')
      }

      // Buscar contagens usando a API de usuários
      const orgsWithCounts = await Promise.all(
        (result.data || []).map(async (org: Organization) => {
          // Usar API em vez de queries diretas
          const [usersResponse, clientsResponse] = await Promise.all([
            fetch(`/api/users?orgId=${org.id}`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }),
            fetch(`/api/clients?orgId=${org.id}`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
          ])

          const usersData = await usersResponse.json()
          const clientsData = await clientsResponse.json()

          return {
            ...org,
            _count: {
              users: usersData.success ? usersData.data?.length || 0 : 0,
              clients: clientsData.success ? clientsData.data?.length || 0 : 0
            }
          }
        })
      )

      setOrganizations(orgsWithCounts)
    } catch (error) {
      console.error('Error loading organizations:', error)
      toast.error('Erro ao carregar organizações')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Nome e slug são obrigatórios')
        return
      }

      if (!formData.ownerEmail) {
        toast.error('Email do Owner é obrigatório')
        return
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.ownerEmail)) {
        toast.error('Email inválido')
        return
      }

      // 1. Criar organização
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          plan: formData.plan,
          status: formData.status
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Enviar convite para o owner
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.ownerEmail,
          name: formData.ownerName || formData.ownerEmail.split('@')[0],
          role: 'owner',
          organization_id: org.id
        })
      })

      const inviteResult = await response.json()

      if (!inviteResult.success) {
        // Se falhar ao enviar convite, avisar mas não deletar a org
        toast.warning(`Organização criada, mas erro ao enviar convite: ${inviteResult.error}`)
      } else {
        toast.success(`Organização criada e convite enviado para ${formData.ownerEmail}!`)
      }

      setDialogOpen(false)
      setFormData({
        name: '',
        slug: '',
        plan: 'free',
        status: 'active',
        ownerEmail: '',
        ownerName: ''
      })
      loadOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Erro ao criar organização')
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={colors[plan as keyof typeof colors]}>
        {plan.toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      active: 'Ativo',
      suspended: 'Suspenso',
      cancelled: 'Cancelado'
    }
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (isLoading || !isSuperAdmin) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Organizações</h1>
            <p className="text-sm text-muted-foreground">
              Painel de controle para super admin
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Organização</DialogTitle>
              <DialogDescription>
                Adicione uma nova organização (cliente) ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Agência XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  placeholder="Ex: agencia-xyz"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3 text-sm">Dados do Owner (Primeiro Usuário)</h4>

                <div className="space-y-2 mb-3">
                  <Label htmlFor="ownerEmail">Email do Owner *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    placeholder="owner@empresa.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Um convite será enviado para este email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome do Owner (Opcional)</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={formData.plan} onValueChange={(value: any) => setFormData(prev => ({ ...prev, plan: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrganization}>
                Criar Organização
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Organizações</p>
              <p className="text-2xl font-bold">{organizations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-2xl font-bold">
                {organizations.reduce((acc, org) => acc + (org._count?.users || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold">
                {organizations.reduce((acc, org) => acc + (org._count?.clients || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organização</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhuma organização encontrada
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                  <TableCell>{getPlanBadge(org.plan)}</TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>{org._count?.users || 0}</TableCell>
                  <TableCell>{org._count?.clients || 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}