"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

type Row = Record<string, string | number | null | undefined>

function toCSV(rows: Row[]): string {
  if (!rows || rows.length === 0) return ""
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))
  const escape = (val: any) => {
    if (val === null || val === undefined) return ""
    const s = String(val)
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(","))
  ]
  return lines.join("\n")
}

function download(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

interface ExportControlsProps {
  data: any[]
  filename?: string
}

export function ExportControls({ data, filename = "facebook_metrics.csv" }: ExportControlsProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return
    const csv = toCSV(data)
    download(filename, csv)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
    </div>
  )
}