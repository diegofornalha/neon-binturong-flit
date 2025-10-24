import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ClientOption, FormState, PLATFORM_LABELS, Status, STATUS_META } from "./types"

interface AccountDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: FormState) => void
  initialData: FormState
  isSaving: boolean
  clients: ClientOption[]
  isEditing: boolean
}

export function AccountDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isSaving,
  clients,
  isEditing,
}: AccountDialogProps) {
  const [form, setForm] = useState<FormState>(initialData)

  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  const handleSubmit = () => {
    if (!form.account_name || !form.account_id) {
      toast.error("Nome e ID da conta são obrigatórios")
      return
    }
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Conta de Anúncios" : "Nova Conta de Anúncios"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da conta que deseja conectar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Select
              value={form.platform}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  platform: value as FormState["platform"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nome da Conta</Label>
            <Input
              value={form.account_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  account_name: event.target.value,
                }))
              }
              placeholder="Ex: Loja XYZ - Facebook Ads"
            />
          </div>

          <div className="space-y-2">
            <Label>ID da Conta</Label>
            <Input
              value={form.account_id}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  account_id: event.target.value,
                }))
              }
              placeholder="Ex: act_1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label>Cliente associado</Label>
            <Select
              value={form.client_id ?? "none"}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  client_id: value === "none" ? null : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as Status,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access Token (opcional)</Label>
            <Input
              type="password"
              value={form.access_token}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  access_token: event.target.value,
                }))
              }
              placeholder="Token de acesso para sincronização"
            />
          </div>

          <div className="space-y-2">
            <Label>Refresh Token (opcional)</Label>
            <Input
              type="password"
              value={form.refresh_token}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  refresh_token: event.target.value,
                }))
              }
              placeholder="Token de renovação para evitar expiração"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Atualizar Conta"
            ) : (
              "Adicionar Conta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}