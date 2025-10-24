"use client"

import { OrganizationProfile } from "@/components/settings/organization-profile"

export default function OrganizacaoSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil da Organização</h1>
        <p className="text-muted-foreground">
          Configure informações e branding da sua organização
        </p>
      </div>
      <OrganizationProfile />
    </div>
  )
}
