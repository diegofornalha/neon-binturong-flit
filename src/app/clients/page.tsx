"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DEFAULT_ORGANIZATION_ID } from "@/lib/organization"
import { Loader2, PlusCircle, Edit, Trash2, Mail, Phone, Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ClientStatus = "active" | "inactive" | "archived"

interface ClientRow {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  status: ClientStatus
  created_at: string
  ad_accounts?: {
    platform: string
    account_name: string
  }[]
}

const statusMeta: Record<ClientStatus, { label: string; badgeClass: string }> = {
  active: { label: "Ativo", badgeClass: "bg-emerald-100 text-emerald-800" },
  inactive: { label: "Inativo", badgeClass: "bg-yellow-100 text-yellow-800" },
  archived: { label: "Arquivado", badgeClass: "bg-gray-100 text-gray-600" },
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active" as ClientStatus,
  })

  useEffect(() => {
    void fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clients?orgId=${DEFAULT_ORGANIZATION_ID}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao carregar clientes")
      }

      setClients(data.data || [])
    } catch (error) {
      console.error("[ClientsPage] load error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao carregar clientes")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients

    const term = search.toLowerCase()

    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term)
      )
    })
  }, [clients, search])

  const openCreateDialog = () => {
    setSelectedClient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "active",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (client: ClientRow) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      status: client.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/clients", {
        method: selectedClient ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(selectedClient && { id: selectedClient.id }),
          organization_id: DEFAULT_ORGANIZATION_ID,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao salvar cliente")
      }

      toast.success(selectedClient ? "Cliente atualizado" : "Cliente criado")
      setDialogOpen(false)
      void fetchClients()
    } catch (error) {
      console.error("[ClientsPage] save error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar cliente")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Deseja remover este cliente?")) return

    try {
      const response = await fetch(`/api/clients?id=${clientId}`, { method: "DELETE" })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao remover cliente")
      }

      toast.success("Cliente removido")
      void fetchClients()
    } catch (error) {
      console.error("[ClientsPage] delete error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao remover cliente")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Acompanhe seus clientes, status de conta e contatos principais
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              {clients.length} clientes cadastrados · {clients.filter((c) => c.status === "active").length} ativos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
              {clients.filter((c) => c.status === "active").length} ativos
            </Badge>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              {clients.filter((c) => c.status === "inactive").length} inativos
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {clients.filter((c) => c.status === "archived").length} arquivados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando clientes...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <Building2 className="mb-2 h-10 w-10" />
              <p>Nenhum cliente encontrado.</p>
              <p className="text-sm">
                {search ? "Tente ajustar a busca para outros termos." : "Clique em “Novo Cliente” para adicionar o primeiro cadastro."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">{client.name}</div>
                        {client.ad_accounts && client.ad_accounts.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {client.ad_accounts.length} contas conectadas
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{client.email || "–"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone || "–"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.company || "–"}</TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", statusMeta[client.status].badgeClass)}>
                          {statusMeta[client.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(client.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {selectedClient
                ? "Atualize as informações do cliente selecionado."
                : "Preencha os dados para cadastrar um novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nome *</Label>
              <Input
                id="client-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">E-mail</Label>
              <Input
                id="client-email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-phone">Telefone</Label>
                <Input
                  id="client-phone"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company">Empresa</Label>
                <Input
                  id="client-company"
                  value={formData.company}
                  onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(Object.keys(statusMeta) as ClientStatus[]).map((statusKey) => (
                  <Button
                    key={statusKey}
                    type="button"
                    variant={formData.status === statusKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, status: statusKey }))}
                  >
                    {statusMeta[statusKey].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : selectedClient ? (
                "Atualizar"
              ) : (
                "Criar cliente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}