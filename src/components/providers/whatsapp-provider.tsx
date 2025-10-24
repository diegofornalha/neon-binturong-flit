"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-provider'

interface WhatsAppInstance {
  id: string
  instance_name: string
  instance_key: string
  evolution_url: string
  evolution_api_key: string
  phone?: string
  status: 'connected' | 'disconnected' | 'qrcode' | 'connecting'
}

interface WhatsAppContextType {
  instances: WhatsAppInstance[]
  activeInstance: WhatsAppInstance | null
  setActiveInstance: (instance: WhatsAppInstance | null) => void
  loadInstances: () => Promise<void>
  isLoading: boolean
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuth()
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [activeInstance, setActiveInstance] = useState<WhatsAppInstance | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar instâncias quando organização mudar
  useEffect(() => {
    if (organization?.id) {
      loadInstances()
    }
  }, [organization?.id])

  // Definir primeira instância como ativa por padrão
  useEffect(() => {
    if (instances.length > 0 && !activeInstance) {
      // Priorizar instâncias conectadas
      const connectedInstance = instances.find(i => i.status === 'connected')
      setActiveInstance(connectedInstance || instances[0])
    }
  }, [instances])

  const loadInstances = async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/instances?orgId=${organization.id}`)
      const data = await response.json()

      if (data.success) {
        setInstances(data.data || [])
      }
    } catch (error) {
      console.error('[WhatsAppProvider] Error loading instances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WhatsAppContext.Provider
      value={{
        instances,
        activeInstance,
        setActiveInstance,
        loadInstances,
        isLoading
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  )
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext)
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider')
  }
  return context
}
