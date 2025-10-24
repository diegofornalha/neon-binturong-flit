"use client"

import { GoogleIntegration } from "@/components/settings/google-integration"

export default function GoogleSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integração Google</h1>
        <p className="text-muted-foreground">
          Configure suas contas de anúncios do Google Ads
        </p>
      </div>
      <GoogleIntegration />
    </div>
  )
}
