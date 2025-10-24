import { serial, text, timestamp, integer, pgTable } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  nivel: integer('nivel').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  nome: text('nome'),
  email: text('email'),
  origem: text('origem'), // Nova coluna para a origem do lead
  createdAt: timestamp('created_at').defaultNow(),
});

export const agendamentos = pgTable('agendamentos', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id),
  vendedorId: integer('vendedor_id').references(() => vendedores.id),
  titulo: text('titulo'),
  data: timestamp('data').notNull(),
  status: text('status').notNull().default('Agendado'), // Nova coluna para o status do Kanban
  createdAt: timestamp('created_at').defaultNow(),
});

export const vendedores = pgTable('vendedores', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});