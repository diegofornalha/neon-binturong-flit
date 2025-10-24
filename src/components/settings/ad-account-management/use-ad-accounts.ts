import { useCallback, useEffect, useState } from "react"
import { DEFAULT_ORGANIZATION_ID } from "@/lib/organization"
import { AdAccount, ClientOption } from "@/components/settings/ad-account-management/types"

interface UseAdAccountsOptions {
  onError?: (error: Error) => void
  organizationId?: string
}

export function useAdAccounts(options: UseAdAccountsOptions = {}) {
  const { onError, organizationId = DEFAULT_ORGANIZATION_ID } = options

  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [accountsRes, clientsRes] = await Promise.all([
        fetch(`/api/ad-accounts?orgId=${organizationId}`),
        fetch(`/api/clients?orgId=${organizationId}`),
      ])

      const accountsJson = await accountsRes.json()
      const clientsJson = await clientsRes.json()

      if (!accountsRes.ok || !accountsJson.success) {
        throw new Error(accountsJson.error || "Falha ao carregar contas de anúncios")
      }

      if (!clientsRes.ok || !clientsJson.success) {
        throw new Error(clientsJson.error || "Falha ao carregar clientes")
      }

      setAccounts(accountsJson.data || [])
      setClients(
        (clientsJson.data || []).map((client: any) => ({
          id: client.id,
          name: client.name,
        }))
      )
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error)
      }
      throw error
    } finally {
      setLoading(false)
    }
  }, [organizationId, onError])

  useEffect(() => {
    fetchData().catch(() => {
      // erro já tratado via onError
    })
  }, [fetchData])

  return {
    accounts,
    clients,
    loading,
    refresh: fetchData,
    setAccounts,
  }
}