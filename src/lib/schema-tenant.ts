import { serial, text, timestamp, integer, pgTable, boolean, jsonb } from 'drizzle-orm/pg-core';

// ============================================
// NOVAS TABELAS MULTI-TENANT
// ============================================

// Tabela de organizações (tenants)
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL amigável: app.com/acme-corp
  plan: text('plan').notNull().default('free'), // 'free', 'pro', 'enterprise'
  status: text('status').notNull().default('active'), // 'active', 'suspended', 'cancelled'
  
  // Limites por plano
  limits: jsonb('limits').$type<{
    maxClients: number;
    maxAdAccounts: number;
    maxUsers: number;
    dataRetentionDays: number;
    reportsPerMonth: number;
  }>().notNull().default({
    maxClients: 1,
    maxAdAccounts: 1,
    maxUsers: 1,
    dataRetentionDays: 30,
    reportsPerMonth: 10
  }),
  
  // Branding white-label
  branding: jsonb('branding').$type<{
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    website?: string;
  }>(),
  
  // Billing
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  billingEmail: text('billing_email'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de usuários (agora vinculados a organizações)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(), // Mantendo nome original por compatibilidade
  name: text('name'),
  avatar: text('avatar'),
  
  role: text('role').notNull().default('member'), // 'owner', 'admin', 'member', 'viewer'
  permissions: jsonb('permissions').$type<string[]>().default([]), // ['view_campaigns', 'edit_campaigns', 'manage_billing']
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de clientes (agora vinculados a organizações)
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'archived'
  
  // Configurações específicas do cliente
  settings: jsonb('settings').$type<{
    timezone?: string;
    currency?: string;
    language?: string;
    notifications?: boolean;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de contas de anúncios (Facebook, Google, etc)
export const adAccounts = pgTable('ad_accounts', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  clientId: integer('client_id').references(() => clients.id),
  
  platform: text('platform').notNull(), // 'facebook', 'google', 'tiktok'
  accountId: text('account_id').notNull(), // ID da conta na plataforma
  accountName: text('account_name').notNull(),
  
  // Credenciais (criptografadas)
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  
  status: text('status').notNull().default('connected'), // 'connected', 'error', 'disconnected'
  lastSync: timestamp('last_sync'),
  
  metadata: jsonb('metadata').$type<{
    currency?: string;
    timezone?: string;
    businessId?: string;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de convites para novos usuários
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  
  invitedBy: integer('invited_by').references(() => users.id),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'expired'
  
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de audit log (rastreamento de ações)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  
  action: text('action').notNull(), // 'user.created', 'campaign.paused', 'report.generated'
  resource: text('resource').notNull(), // 'user', 'campaign', 'report'
  resourceId: text('resource_id'),
  
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// TABELA DE MIGRAÇÃO (para rastrear progresso)
// ============================================
export const migrations = pgTable('data_migrations', {
  id: serial('id').primaryKey(),
  tableName: text('table_name').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'failed'
  recordsMigrated: integer('records_migrated').default(0),
  totalRecords: integer('total_records').default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});