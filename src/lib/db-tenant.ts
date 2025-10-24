import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schemaTenant from './schema-tenant';
import * as schemaLegacy from './schema'; // Schema antigo

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const client = postgres(connectionString);

// Database com ambos os schemas (novo e legado)
export const db = drizzle(client, { 
  schema: { 
    ...schemaTenant, 
    ...schemaLegacy 
  } 
});

// Tipos exportados
export type Organization = typeof schemaTenant.organizations.$inferSelect;
export type NewOrganization = typeof schemaTenant.organizations.$inferInsert;

export type User = typeof schemaTenant.users.$inferSelect;
export type NewUser = typeof schemaTenant.users.$inferInsert;

export type Client = typeof schemaTenant.clients.$inferSelect;
export type NewClient = typeof schemaTenant.clients.$inferInsert;

export type AdAccount = typeof schemaTenant.adAccounts.$inferSelect;
export type NewAdAccount = typeof schemaTenant.adAccounts.$inferInsert;

export type Invitation = typeof schemaTenant.invitations.$inferSelect;
export type AuditLog = typeof schemaTenant.auditLogs.$inferSelect;