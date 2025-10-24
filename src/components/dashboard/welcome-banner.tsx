"use client"

import { Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/components/providers/locale-provider"
import { getTranslation } from "@/lib/i18n"

export function WelcomeBanner() {
  const { locale } = useLocale()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('dashboard.greeting')} 👋</h1>
        </div>
        
        <p className="text-blue-100 text-lg mb-6 max-w-2xl">
          {t('dashboard.greeting.subtitle')}
        </p>
        
        <div className="flex gap-4">
          <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('dashboard.insights.today')}
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            {t('dashboard.updated.now')}
          </Button>
        </div>
      </div>
    </div>
  )
}