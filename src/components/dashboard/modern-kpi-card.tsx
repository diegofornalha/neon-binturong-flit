"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ModernKPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: 'blue' | 'orange' | 'red' | 'green'
  progress?: number
  subtitle?: string
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    progress: 'bg-blue-500',
    text: 'text-blue-600',
    change: 'text-blue-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    progress: 'bg-orange-500',
    text: 'text-orange-600',
    change: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    progress: 'bg-red-500',
    text: 'text-red-600',
    change: 'text-red-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    progress: 'bg-green-500',
    text: 'text-green-600',
    change: 'text-green-600'
  }
}

export function ModernKPICard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  progress = 75,
  subtitle,
  className 
}: ModernKPICardProps) {
  const colors = colorVariants[color]
  
  return (
    <Card className={cn("border-0 shadow-sm hover:shadow-md transition-shadow", colors.bg, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", colors.icon)}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", 
              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"
            )}>
              <span>{change > 0 ? "↗" : change < 0 ? "↘" : "→"}</span>
              {change > 0 ? "+" : ""}{change}%
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Meta: 15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn("h-2 rounded-full transition-all duration-500", colors.progress)}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}