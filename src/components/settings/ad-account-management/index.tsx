"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { AccountsTable } from "./accounts-table"
import { StatsOverview } from "./stats-overview"
import { AccountDialog } from "./account-dialog"
import { AdAccount, DEFAULT_FORM, FormState, ClientOption } from "./types"

export function AdAccountManagement() {
  const { organization, isSuperAdmin, session } = useAuth()
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AdAccount | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Carregar organizações se for super admin
  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations()
    } else if (organization) {
      setSelectedOrgId(organization.id)
    }
  }, [isSuperAdmin, organization])

  // Carregar dados quando organização for selecionada
  useEffect(() => {
    if (selectedOrgId) {
      loadData()
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

  const loadData = async () => {
    if (!selectedOrgId) return
    
    try {
      setLoading(true)
      const [accountsRes, clientsRes] = await Promise.all([
        fetch(`/api/ad-accounts?orgId=${selectedOrgId}`),
        fetch(`/api/clients?orgId=${selectedOrgId}`),
      ])

      const accountsJson = await accountsRes.json()
      const clientsJson = await clientsRes.json()

      if (accountsJson.success) {
        setAccounts(accountsJson.data || [])
      }

      if (clientsJson.success) {
        setClients(
          (clientsJson.data || []).map((client: any) => ({
            id: client.id,
            name: client.name,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingAccount(null)
    setDialogOpen(true)
  }

  const openEditDialog = (account: AdAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingAccount(null)
  }

  const handleSubmit = async (form: FormState) => {
    if (!selectedOrgId) {
      toast.error('Selecione uma organização')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        organization_id: selectedOrgId,
      }

      const response = await fetch("/api/ad-accounts", {
        method: editingAccount ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingAccount ? { id: editingAccount.id, ...payload } : payload
        ),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao salvar conta")
      }

      toast.success(editingAccount ? "Conta atualizada" : "Conta criada")
      closeDialog()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm("Tem certeza que deseja remover esta conta?")) return
    try {
      setDeletingId(accountId)

      const response = await fetch(`/api/ad-accounts?id=${accountId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao remover conta")
      }

      toast.success("Conta removida")
      setAccounts((prev) => prev.filter((account) => account.id !== accountId))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando contas de anúncios...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Contas de Anúncios</CardTitle>
            <CardDescription>
              Conecte e gerencie contas de Facebook, Google ou TikTok para cada cliente.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <StatsOverview accounts={accounts} />

        <div className="rounded-md border">
          <AccountsTable
            accounts={accounts}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </CardContent>

      <AccountDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        initialData={
          editingAccount
            ? {
                platform: editingAccount.platform,
                account_name: editingAccount.account_name,
                account_id: editingAccount.account_id,
                status: editingAccount.status,
                client_id: editingAccount.client_id,
                access_token: editingAccount.access_token || "",
                refresh_token: editingAccount.refresh_token || "",
              }
            : DEFAULT_FORM
        }
        isSaving={saving}
        clients={clients}
        isEditing={Boolean(editingAccount)}
      />
    </Card>
  )
}