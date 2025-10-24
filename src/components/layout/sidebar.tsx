"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Building2,
  Shield,
  Facebook,
  Chrome
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/providers/locale-provider"
import { getTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/providers/auth-provider"
import { useWhatsApp } from "@/components/providers/whatsapp-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageSquare, CheckCircle, XCircle } from "lucide-react"

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "clients", href: "/clients", icon: Users },
  { name: "campaigns", href: "/campaigns", icon: TrendingUp },
  { name: "Meta Ads", href: "/facebook-ads", icon: Facebook },
  { name: "Google Ads", href: "/google-ads", icon: Chrome },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageSquare },
  { name: "reports", href: "/reports", icon: FileText },
  { name: "settings", href: "/settings", icon: Settings },
]

const superAdminNavigation = [
  { name: "Organizações", href: "/admin/organizations", icon: Shield },
]

export function SidebarContent() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const { isSuperAdmin } = useAuth()
  const { instances, activeInstance, setActiveInstance } = useWhatsApp()
  const t = (key: string) => getTranslation(locale, key)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Carmen SDR</h1>
          <p className="text-xs text-slate-400">Dashboard Premium</p>
        </div>
      </div>

      {/* WhatsApp Instance Selector */}
      {instances.length > 0 && (
        <div className="px-4 py-4 border-b border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Instância WhatsApp
          </label>
          <Select
            value={activeInstance?.id || ""}
            onValueChange={(value) => {
              const instance = instances.find(i => i.id === value)
              if (instance) setActiveInstance(instance)
            }}
          >
            <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
              <SelectValue>
                {activeInstance ? (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{activeInstance.instance_name}</span>
                    {activeInstance.status === 'connected' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                ) : (
                  "Selecione uma instância"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => (
                <SelectItem key={instance.id} value={instance.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{instance.instance_name}</span>
                    {instance.phone && (
                      <span className="text-xs text-muted-foreground">
                        ({instance.phone})
                      </span>
                    )}
                    {instance.status === 'connected' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.name)}
            </Link>
          )
        })}
        
        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <div className="pt-6 pb-2">
              <div className="flex items-center gap-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Shield className="h-4 w-4" />
                Super Admin
              </div>
            </div>
            {superAdminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-400 text-center">
          © 2025 Carmen SDR. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col">
      <SidebarContent />
    </aside>
  )
}