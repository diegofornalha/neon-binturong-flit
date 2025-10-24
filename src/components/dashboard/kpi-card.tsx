import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  className?: string
}

export function KPICard({ title, value, change, icon, className }: KPICardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs text-muted-foreground",
            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : ""
          )}>
            {change > 0 ? "+" : ""}
            {change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}