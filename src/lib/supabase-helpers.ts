import { supabase } from '@/integrations/supabase/client'
import type { Organization, User, Client, AdAccount } from '@/integrations/supabase/client'

/**
 * Helpers para sistema multi-tenant no Supabase
 */

// ============================================
// ORGANIZATIONS
// ============================================

export async function getOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  
  if (error) throw error
  return data as Organization
}

export async function getOrganizationBySlug(slug: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data as Organization
}

export async function createOrganization(org: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select()
    .single()
  
  if (error) throw error
  return data as Organization
}

export async function updateOrganization(orgId: string, updates: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orgId)
    .select()
    .single()
  
  if (error) throw error
  return data as Organization
}

// ============================================
// USERS
// ============================================

export async function getUsersByOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as User[]
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as User
}

// ============================================
// CLIENTS
// ============================================

export async function getClientsByOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Client[]
}

export async function createClient(client: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export async function updateClient(clientId: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export async function deleteClient(clientId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
  
  if (error) throw error
}

// ============================================
// AD ACCOUNTS
// ============================================

export async function getAdAccountsByOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*, clients(*)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (AdAccount & { clients: Client })[]
}

export async function getAdAccountsByClient(clientId: string) {
  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as AdAccount[]
}

export async function createAdAccount(account: Partial<AdAccount>) {
  const { data, error } = await supabase
    .from('ad_accounts')
    .insert(account)
    .select()
    .single()
  
  if (error) throw error
  return data as AdAccount
}

export async function updateAdAccount(accountId: string, updates: Partial<AdAccount>) {
  const { data, error } = await supabase
    .from('ad_accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .select()
    .single()
  
  if (error) throw error
  return data as AdAccount
}

// ============================================
// AUDIT LOGS
// ============================================

export async function createAuditLog(log: {
  organization_id: string
  user_id?: string
  action: string
  resource: string
  resource_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
}) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getAuditLogs(orgId: string, limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, users(name, email)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// ============================================
// INVITATIONS
// ============================================

export async function createInvitation(invitation: {
  organization_id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invited_by?: string
}) {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias
  
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      ...invitation,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getInvitationByToken(token: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, organizations(*)')
    .eq('token', token)
    .single()
  
  if (error) throw error
  return data
}

export async function acceptInvitation(token: string, userId: string) {
  const { data, error } = await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('token', token)
    .select()
    .single()
  
  if (error) throw error
  return data
}