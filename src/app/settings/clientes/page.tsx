"use client"

import { ClientManagement } from "@/components/settings/client-management"

export default function ClientesSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie seus clientes e suas contas de anúncios conectadas
        </p>
      </div>
      <ClientManagement />
    </div>
  )
}
