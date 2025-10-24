"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/components/providers/auth-provider'

interface OrganizationContextType {
  organizationId: string | null
  organizationName: string | null
  organizationSlug: string | null
  plan: 'free' | 'pro' | 'enterprise' | null
  limits: {
    maxClients: number
    maxAdAccounts: number
    maxUsers: number
    dataRetentionDays: number
    reportsPerMonth: number
  } | null
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuth()

  const value: OrganizationContextType = {
    organizationId: organization?.id || null,
    organizationName: organization?.name || null,
    organizationSlug: organization?.slug || null,
    plan: (organization as any)?.plan || null,
    limits: (organization as any)?.limits || null,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}