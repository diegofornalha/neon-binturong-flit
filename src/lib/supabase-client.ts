import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcXlwd2t2Z296a3Zpc3diaGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzYwNjgsImV4cCI6MjA3NDk1MjA2OH0.XPlaF3HzFZhvwxjqP5x3N6b45inM9rxTOxQwgjxhz9A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Verifica se usuário é super admin (dono do SaaS)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (error || !data) return false
  return data.is_super_admin === true
}

/**
 * Helper para obter organization_id do usuário atual
 * Super admin retorna null (tem acesso a tudo)
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('organization_id, is_super_admin')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  
  // Super admin não tem organization_id específico (acessa tudo)
  if (data.is_super_admin) return null
  
  return data.organization_id
}

/**
 * Helper para verificar se usuário tem permissão
 */
export async function hasPermission(requiredRole: 'owner' | 'admin' | 'member' | 'viewer'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('users')
    .select('role, is_super_admin')
    .eq('id', user.id)
    .single()

  if (error || !data) return false

  // Super admin tem todas as permissões
  if (data.is_super_admin) return true

  const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 }
  const userLevel = roleHierarchy[data.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole]

  return userLevel >= requiredLevel
}

/**
 * Helper para criar audit log
 */
export async function createAuditLog(params: {
  action: string
  resource: string
  resource_id?: string
  metadata?: Record<string, any>
  organization_id?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Se organization_id não foi passado, pegar do usuário
  let orgId = params.organization_id
  if (!orgId) {
    orgId = await getCurrentOrganizationId() || undefined
  }

  if (!orgId) {
    console.warn('Cannot create audit log without organization_id')
    return
  }

  await supabase.from('audit_logs').insert({
    organization_id: orgId,
    user_id: user.id,
    action: params.action,
    resource: params.resource,
    resource_id: params.resource_id,
    metadata: params.metadata || {}
  })
}

/**
 * Helper para obter dados completos do usuário
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data
}