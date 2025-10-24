"use client"

import { AdAccountManagement } from "@/components/settings/ad-account-management"

export default function ContasSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Contas de Anúncios</h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas contas de anúncios conectadas
        </p>
      </div>
      <AdAccountManagement />
    </div>
  )
}
