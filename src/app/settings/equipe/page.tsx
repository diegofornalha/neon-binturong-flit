"use client"

import { TeamManagement } from "@/components/settings/team-management"

export default function EquipeSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Equipe</h1>
        <p className="text-muted-foreground">
          Convide membros para sua organização e gerencie permissões
        </p>
      </div>
      <TeamManagement />
    </div>
  )
}
