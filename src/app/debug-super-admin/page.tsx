"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugSuperAdminPage() {
  const { user, organization, isSuperAdmin, isLoading, session } = useAuth()
  const [orgs, setOrgs] = useState<any[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganizations()
    }
  }, [isSuperAdmin])

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true)
      const response = await fetch('/api/organizations/list', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await response.json()

      if (data.success) {
        setOrgs(data.data || [])
      } else {
        setError(data.error || 'Erro ao carregar organizações')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoadingOrgs(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Super Admin</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>Nome:</strong> {user?.name || 'N/A'}
          </div>
          <div>
            <strong>Role:</strong> {user?.role || 'N/A'}
          </div>
          <div>
            <strong>Organization ID:</strong> {user?.organization_id || 'NULL (correto para super admin)'}
          </div>
          <div>
            <strong>É Super Admin:</strong> {isSuperAdmin ? '✅ SIM' : '❌ NÃO'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organização Atual</CardTitle>
        </CardHeader>
        <CardContent>
          {organization ? (
            <div className="space-y-2">
              <div><strong>ID:</strong> {organization.id}</div>
              <div><strong>Nome:</strong> {organization.name}</div>
              <div><strong>Slug:</strong> {organization.slug}</div>
              <div><strong>Plano:</strong> {organization.plan}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              {isSuperAdmin
                ? '✅ NULL (correto - super admin não tem organização específica)'
                : '❌ Nenhuma organização associada'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Organizações Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrgs ? (
              <div>Carregando organizações...</div>
            ) : error ? (
              <div className="text-red-500">Erro: {error}</div>
            ) : orgs.length === 0 ? (
              <div className="text-yellow-500">⚠️ Nenhuma organização encontrada!</div>
            ) : (
              <div className="space-y-2">
                <div><strong>Total:</strong> {orgs.length} organizações</div>
                <ul className="space-y-1">
                  {orgs.map((org) => (
                    <li key={org.id} className="p-2 bg-slate-800 rounded">
                      <div><strong>{org.name}</strong></div>
                      <div className="text-sm text-muted-foreground">
                        ID: {org.id} | Slug: {org.slug} | Plano: {org.plan}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Testes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <a
              href="/settings"
              className="text-blue-500 hover:underline"
            >
              → Ir para Configurações
            </a>
          </div>
          <div>
            <a
              href="/api/debug/check-user?email=sostenesmeister@gmail.com"
              className="text-blue-500 hover:underline"
              target="_blank"
            >
              → Verificar usuário no banco (abre em nova aba)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
