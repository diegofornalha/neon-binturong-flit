"use client"

import { AISettings } from "@/components/settings/ai-settings"

export default function GeralSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">
          Configure IA e outras preferências da plataforma
        </p>
      </div>
      <AISettings />
    </div>
  )
}
