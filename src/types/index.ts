export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'analyst' | 'client'
  clientId?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface AdAccount {
  id: string
  clientId: string
  platform: 'facebook' | 'google'
  accountId: string
  accountName: string
  accessToken?: string
  refreshToken?: string
  connected: boolean
  lastSync?: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  accountId: string
  platform: 'facebook' | 'google'
  campaignId: string
  name: string
  status: 'active' | 'paused' | 'archived'
  objective: string
  startDate: string
  endDate?: string
  budget?: number
  createdAt: string
  updatedAt: string
}

export interface Metrics {
  id: string
  campaignId: string
  date: string
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  cost: number
  conversions: number
  cpa: number
  roas: number
  createdAt: string
}

export interface Report {
  id: string
  clientId: string
  name: string
  format: 'pdf' | 'csv'
  frequency: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  lastSent?: string
  nextSend: string
  createdAt: string
}