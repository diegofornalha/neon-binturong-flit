"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  Target,
  MessageSquare,
  Facebook,
  Chrome,
  Building2,
  FileText,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react"

const settingsPages = [
  {
    href: "/settings/clientes",
    icon: Users,
    title: "Clientes",
    description: "Gerencie seus clientes e contas de anúncios"
  },
  {
    href: "/settings/equipe",
    icon: UserPlus,
    title: "Equipe",
    description: "Convide membros e gerencie permissões"
  },
  {
    href: "/settings/contas",
    icon: Target,
    title: "Contas de Anúncios",
    description: "Gerencie todas as contas conectadas"
  },
  {
    href: "/settings/whatsapp",
    icon: MessageSquare,
    title: "WhatsApp",
    description: "Configure instâncias WhatsApp Business"
  },
  {
    href: "/settings/facebook",
    icon: Facebook,
    title: "Facebook",
    description: "Integração com Facebook Ads"
  },
  {
    href: "/settings/google",
    icon: Chrome,
    title: "Google",
    description: "Integração com Google Ads"
  },
  {
    href: "/settings/organizacao",
    icon: Building2,
    title: "Organização",
    description: "Perfil e branding da organização"
  },
  {
    href: "/settings/relatorios",
    icon: FileText,
    title: "Relatórios",
    description: "Configure e gere relatórios personalizados"
  },
  {
    href: "/settings/geral",
    icon: SettingsIcon,
    title: "Geral",
    description: "Configurações de IA e preferências"
  }
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie clientes, equipe, integrações e configurações da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsPages.map((page) => {
          const Icon = page.icon
          return (
            <Link key={page.href} href={page.href}>
              <Card className="hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-600/10">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
