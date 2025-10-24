"use client"

import { WhatsAppManagement } from "@/components/settings/whatsapp-management"

export default function WhatsAppSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações WhatsApp</h1>
        <p className="text-muted-foreground">
          Configure e gerencie suas instâncias WhatsApp Business
        </p>
      </div>
      <WhatsAppManagement />
    </div>
  )
}
