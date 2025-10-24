"use client"

import { useState } from "react"
import { LogOut, Menu, Building2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/sidebar"
import { useLocale } from "@/components/providers/locale-provider"
import { getTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/providers/auth-provider"

export function Header() {
  const { locale } = useLocale()
  const { user, organization, isSuperAdmin, signOut } = useAuth()
  
  const t = (key: string) => getTranslation(locale, key)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'

  const getRoleBadge = (role?: string, superAdmin?: boolean) => {
    if (superAdmin) {
      return (
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      )
    }
    
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      owner: 'Proprietário',
      admin: 'Admin',
      member: 'Membro',
      viewer: 'Visualizador'
    }
    
    if (!role) return null
    
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop left side - empty spacer */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Super Admin Badge */}
          {isSuperAdmin && (
            <Badge className="hidden lg:flex bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
          
          {/* Organization Info */}
          {organization && !isSuperAdmin && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">{organization.name}</span>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className={`w-8 h-8 ${isSuperAdmin ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-medium`}>
                  {userInitial}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-slate-100">{user?.name || user?.email}</div>
                  <div className="text-xs text-slate-400 capitalize">
                    {isSuperAdmin ? 'Super Admin' : user?.role}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {organization && !isSuperAdmin && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Organização</span>
                        <span className="text-sm font-medium">{organization.name}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Permissão</span>
                  {getRoleBadge(user?.role, isSuperAdmin)}
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}