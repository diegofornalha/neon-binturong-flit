import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcXlwd2t2Z296a3Zpc3diaGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzYwNjgsImV4cCI6MjA3NDk1MjA2OH0.XPlaF3HzFZhvwxjqP5x3N6b45inM9rxTOxQwgjxhz9A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco
export interface Organization {
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
  stripe_customer_id?: string
  stripe_subscription_id?: string
  billing_email?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id: string
  email: string
  name?: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: string[]
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: 'active' | 'inactive' | 'archived'
  settings?: {
    timezone?: string
    currency?: string
    language?: string
    notifications?: boolean
  }
  created_at: string
  updated_at: string
}

export interface AdAccount {
  id: string
  organization_id: string
  client_id?: string
  platform: 'facebook' | 'google' | 'tiktok'
  account_id: string
  account_name: string
  access_token?: string
  refresh_token?: string
  status: 'connected' | 'error' | 'disconnected'
  last_sync?: string
  metadata?: {
    currency?: string
    timezone?: string
    businessId?: string
  }
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  organization_id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  token: string
  invited_by?: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id?: string
  action: string
  resource: string
  resource_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}