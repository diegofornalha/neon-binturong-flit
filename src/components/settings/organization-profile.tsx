"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Loader2, Save, Crown, Zap, Rocket } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  limits: {
    maxClients: number
    maxAdAccounts: number
    maxUsers: number
    dataRetentionDays: number
    reportsPerMonth: number
  }
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    companyName?: string
    website?: string
  }
  billing_email?: string
  created_at: string
}

const PLAN_INFO = {
  free: {
    label: 'Gratuito',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800',
    description: 'Ideal para começar'
  },
  pro: {
    label: 'Profissional',
    icon: <Rocket className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800',
    description: 'Para gestores de tráfego'
  },
  enterprise: {
    label: 'Enterprise',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800',
    description: 'Para agências'
  }
}

export function OrganizationProfile() {
  const { organization: userOrg, isSuperAdmin, session } = useAuth()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    billing_email: "",
    branding: {
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      companyName: "",
      website: ""
    }
  })

  // Carregar organizações se for super admin
  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations()
    } else if (userOrg) {
      setSelectedOrgId(userOrg.id)
    }
  }, [isSuperAdmin, userOrg])

  // Carregar dados da organização quando selecionada
  useEffect(() => {
    if (selectedOrgId) {
      loadOrganization()
    }
  }, [selectedOrgId])

  const loadOrganizations = async () => {
    try {
      // Super admin precisa buscar via API para bypass de RLS
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
      console.error('Error loading organizations:', error)
      toast.error('Erro ao carregar organizações')
    }
  }

  const loadOrganization = async () => {
    if (!selectedOrgId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations?orgId=${selectedOrgId}`)
      const data = await response.json()
      
      if (data.success) {
        const org = data.data.organization
        setOrganization(org)
        setFormData({
          name: org.name,
          slug: org.slug,
          billing_email: org.billing_email || "",
          branding: {
            primaryColor: org.branding?.primaryColor || "#3b82f6",
            secondaryColor: org.branding?.secondaryColor || "#8b5cf6",
            companyName: org.branding?.companyName || "",
            website: org.branding?.website || ""
          }
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[OrganizationProfile] Error loading:', error)
      toast.error('Erro ao carregar organização')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nome e slug são obrigatórios")
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrgId,
          name: formData.name,
          slug: formData.slug,
          billing_email: formData.billing_email,
          branding: formData.branding
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Organização atualizada com sucesso!')
        loadOrganization()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[OrganizationProfile] Error saving:', error)
      toast.error('Erro ao salvar organização')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !selectedOrgId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Organização não encontrada</p>
        </CardContent>
      </Card>
    )
  }

  const planInfo = PLAN_INFO[organization.plan]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Perfil da Organização
            </CardTitle>
            <CardDescription>
              Gerencie as informações e configurações da sua organização
            </CardDescription>
          </div>
          {isSuperAdmin && organizations.length > 0 && (
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione organização" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Badge */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${planInfo.color}`}>
              {planInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold">Plano {planInfo.label}</h3>
              <p className="text-sm text-muted-foreground">{planInfo.description}</p>
            </div>
          </div>
          <Badge className={planInfo.color}>
            {planInfo.label}
          </Badge>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Organização *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Minha Agência"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="minha-agencia"
              />
              <p className="text-xs text-muted-foreground">
                URL: app.com/{formData.slug}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-email">Email de Cobrança</Label>
            <Input
              id="billing-email"
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
              placeholder="financeiro@empresa.com"
            />
          </div>
        </div>

        <Separator />

        {/* Branding */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Branding White-Label</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={formData.branding.companyName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  branding: { ...prev.branding, companyName: e.target.value }
                }))}
                placeholder="Minha Agência Digital"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.branding.website}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  branding: { ...prev.branding, website: e.target.value }
                }))}
                placeholder="https://minhaagencia.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.branding.primaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={formData.branding.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, secondaryColor: e.target.value }
                  }))}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.branding.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, secondaryColor: e.target.value }
                  }))}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Plan Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Limites do Plano</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Clientes</div>
              <div className="text-2xl font-bold">{organization.limits.maxClients}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Contas de Anúncios</div>
              <div className="text-2xl font-bold">{organization.limits.maxAdAccounts}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Usuários</div>
              <div className="text-2xl font-bold">{organization.limits.maxUsers}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Retenção de Dados</div>
              <div className="text-2xl font-bold">{organization.limits.dataRetentionDays} dias</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Relatórios/Mês</div>
              <div className="text-2xl font-bold">{organization.limits.reportsPerMonth}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}