import { useMemo } from "react"
import { AdAccount, Platform, PLATFORM_LABELS } from "./types"

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

interface StatsOverviewProps {
  accounts: AdAccount[]
}

export function StatsOverview({ accounts }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const accumulator = {
      total: accounts.length,
      byPlatform: {
        facebook: 0,
        google: 0,
        tiktok: 0,
      } as Record<Platform, number>,
    }

    accounts.forEach((account) => {
      accumulator.byPlatform[account.platform] += 1
    })

    return accumulator
  }, [accounts])

  return (
    <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
      <SummaryCard label="Total de Contas" value={stats.total} />
      {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
        <SummaryCard
          key={platform}
          label={PLATFORM_LABELS[platform]}
          value={stats.byPlatform[platform]}
        />
      ))}
    </div>
  )
}