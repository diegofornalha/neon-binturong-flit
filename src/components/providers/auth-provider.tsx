"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  organization_id?: string
  is_super_admin?: boolean
}

interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  limits: {
    maxClients: number
    maxAdAccounts: number
    maxUsers: number
    dataRetentionDays: number
    reportsPerMonth: number
  }
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    companyName?: string
    website?: string
  }
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  session: Session | null
  isLoading: boolean
  isSuperAdmin: boolean
  signOut: () => Promise<void>
  refreshOrganization: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Event:', event, 'Session:', !!session)
        setSession(session)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
          
          // Redirecionar para dashboard após login
          if (event === 'SIGNED_IN' && pathname === '/login') {
            router.push('/dashboard')
          }
        } else {
          setUser(null)
          setOrganization(null)
          setIsSuperAdmin(false)
          setIsLoading(false)
          
          // Redirecionar para login se não estiver em rota pública
          if (event === 'SIGNED_OUT' && !isPublicRoute(pathname)) {
            router.push('/login')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const loadUserProfile = async (userId: string) => {
    try {
      // Usar API server-side para bypass de RLS
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.user) {
        console.error('Error fetching user profile:', data.error)
        // Se não encontrar perfil, criar um básico com dados do auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
            role: 'member',
            is_super_admin: false
          })
          setIsSuperAdmin(false)
        }
        setIsLoading(false)
        return
      }

      // Configurar dados do usuário
      setUser(data.user as User)
      setIsSuperAdmin(data.user.is_super_admin === true)

      // Configurar organização (já vem da API)
      if (data.organization) {
        setOrganization(data.organization as Organization)
      } else {
        setOrganization(null)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Fallback: usar dados básicos do auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
          role: 'member',
          is_super_admin: false
        })
        setIsSuperAdmin(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrganization = async () => {
    if (!user?.organization_id) return
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single()
    
    if (!error && data) {
      setOrganization(data as Organization)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setOrganization(null)
    setIsSuperAdmin(false)
    router.push('/login')
  }

  const isPublicRoute = (path: string | null) => {
    if (!path) return false
    return path === '/' || path === '/login' || path.startsWith('/accept-invite')
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, organization, session, isLoading, isSuperAdmin, signOut, refreshOrganization }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}