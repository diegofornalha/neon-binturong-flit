import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, PenLine, Trash2 } from "lucide-react"
import { AdAccount, PLATFORM_LABELS, STATUS_META } from "./types"

interface AccountsTableProps {
  accounts: AdAccount[]
  onEdit: (account: AdAccount) => void
  onDelete: (accountId: string) => void
  deletingId: string | null
}

export function AccountsTable({ accounts, onEdit, onDelete, deletingId }: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
              Nenhuma conta conectada. Clique em “Nova Conta” para começar.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Conta</TableHead>
          <TableHead>Plataforma</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{account.account_name}</span>
                <span className="text-sm text-muted-foreground">{account.account_id}</span>
              </div>
            </TableCell>
            <TableCell>{PLATFORM_LABELS[account.platform]}</TableCell>
            <TableCell>{account.clients?.name || "Sem cliente"}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${STATUS_META[account.status].badgeClass}`}
              >
                {STATUS_META[account.status].label}
              </span>
            </TableCell>
            <TableCell>
              {new Date(account.created_at).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
                  <PenLine className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(account.id)}
                  disabled={deletingId === account.id}
                >
                  {deletingId === account.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}