"use client"

import { ReportGenerator } from "@/components/reports/report-generator"

export default function RelatoriosSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gerador de Relatórios</h1>
        <p className="text-muted-foreground">
          Configure e gere relatórios personalizados
        </p>
      </div>
      <ReportGenerator clients={[]} />
    </div>
  )
}
