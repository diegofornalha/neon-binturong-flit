"use client"

import { FacebookIntegration } from "@/components/settings/facebook-integration"

export default function FacebookSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integração Facebook</h1>
        <p className="text-muted-foreground">
          Configure suas contas de anúncios do Facebook
        </p>
      </div>
      <FacebookIntegration />
    </div>
  )
}
