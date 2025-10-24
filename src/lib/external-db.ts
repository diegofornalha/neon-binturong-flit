import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  serial,
  text,
  timestamp,
  integer,
  pgTable,
  boolean,
} from 'drizzle-orm/pg-core';

/**
 * Variáveis de ambiente permitidas:
 * - Preferência: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * - Compatibilidade: EXTERNAL_DB_HOST, EXTERNAL_DB_PORT, EXTERNAL_DB_NAME, EXTERNAL_DB_USER, EXTERNAL_DB_PASSWORD
 */
const DB_HOST = process.env.DB_HOST || process.env.EXTERNAL_DB_HOST;
const DB_PORT = process.env.DB_PORT || process.env.EXTERNAL_DB_PORT;
const DB_NAME = process.env.DB_NAME || process.env.EXTERNAL_DB_NAME;
const DB_USER = process.env.DB_USER || process.env.EXTERNAL_DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.EXTERNAL_DB_PASSWORD;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error('[external-db] Variáveis de ambiente ausentes:');
  console.error({
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD: DB_PASSWORD ? '***' : undefined,
  });
  throw new Error(
    'Credenciais do banco externo não configuradas. Defina DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD.',
  );
}

// Monta a connection string
const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

/**
 * Schema da tabela public.leads (respeitando o schema enviado)
 */
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  nome_completo: text('nome_completo'),
  email: text('email'),
  telefone: text('telefone'),
  data_criacao: timestamp('data_criacao'),
  data_atualizacao: timestamp('data_atualizacao'),
  etapa_funil: text('etapa_funil'),
  interesse_compra: boolean('interesse_compra'),
  conhece_produto: boolean('conhece_produto'),
  tem_uso_definido: boolean('tem_uso_definido'),
  tem_forma_pagamento: boolean('tem_forma_pagamento'),
  lead_urgente: boolean('lead_urgente'),
  dados_coletados: boolean('dados_coletados'),
  pronto_vendedor: boolean('pronto_vendedor'),
  lastinteraction: timestamp('lastinteraction'),
  follow_up: integer('follow_up'),
  imagem_enviada: boolean('imagem_enviada').default(false),
  video_enviado: boolean('video_enviado').default(false),
  sessionId: text('sessionId'),
  remoteJid: text('remoteJid'),
  origem: text('origem'),
  veiculo_pretendido: text('veiculo_pretendido'),
  Site_Empresa: text('Site_Empresa'),
  Rede_Social_Empresa: text('Rede_Social_Empresa'),
  vendedor_responsavel: text('vendedor_responsavel'),
  status_agendamento: text('status_agendamento'),
  data_test_drive: timestamp('data_test_drive'),
  agendamento_id: integer('agendamento_id'),
  data_cancelamento: timestamp('data_cancelamento'),
  motivo_cancelamento: text('motivo_cancelamento'),
  sessionid_whatsapp: text('sessionid_whatsapp'),
  sessionid_instagram: text('sessionid_instagram'),
  sessionid_facebook: text('sessionid_facebook'),
  sessionid_principal: text('sessionid_principal'),
  last_followup_sent: timestamp('last_followup_sent', { withTimezone: true }),
  comment_id_instagram: text('comment_id_instagram'),
  media_id_instagram: text('media_id_instagram'),
  contador_mensagens: integer('contador_mensagens').default(0),
  id_prospect_zoho: text('id_prospect_zoho'),
  chatwoot_conversation_id: integer('chatwoot_conversation_id'),
  chatwoot_sender_id: integer('chatwoot_sender_id'),
  facebook_user_id: text('facebook_user_id'),
  status: text('status'),
  company_id: integer('company_id'),
  notifica_vendedor: boolean('notifica_vendedor'),
});

/**
 * Schema de agendamentos
 */
export const agendamentos = pgTable('agendamentos', {
    id: serial('id').primaryKey(),
    session_id: text('session_id').notNull(),
    lead_id: integer('lead_id'),
    vendedor_id: integer('vendedor_id'),
    cliente_nome: text('cliente_nome').notNull(),
    cliente_email: text('cliente_email').notNull(),
    cliente_telefone: text('cliente_telefone'),
    veiculo: text('veiculo'),
    data_agendamento: timestamp('data_agendamento').notNull(),
    data_fim_agendamento: timestamp('data_fim_agendamento').notNull(),
    status: text('status').default('PENDENTE'),
    google_event_id: text('google_event_id'),
    observacoes: text('observacoes'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    zoho_event_id: text('zoho_event_id'),
    tipo_agendamento: text('tipo_agendamento').default('visita_showroom'),
    veiculo_id: integer('veiculo_id'),
    data_cancelamento: timestamp('data_cancelamento'),
    motivo_cancelamento: text('motivo_cancelamento'),
    cancelado_por: text('cancelado_por'),
    notificado_2h: boolean('notificado_2h').default(false),
    data_notificacao_2h: timestamp('data_notificacao_2h'),
    notificado_30min: boolean('notificado_30min').default(false),
    data_notificacao_30min: timestamp('data_notificacao_30min'),
    confirmado_2h: boolean('confirmado_2h').default(false),
    data_confirmacao_2h: timestamp('data_confirmacao_2h'),
    confirmado_30min: boolean('confirmado_30min').default(false),
    data_confirmacao_30min: timestamp('data_confirmacao_30min'),
    confirmacao_final: text('confirmacao_final').default('PENDENTE'),
    company_id: integer('company_id'),
});

/**
 * Schema de vendedores
 */
export const vendedores = pgTable('vendedores', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
});

let client: postgres.Sql | null = null;

try {
  client = postgres(connectionString, { max: 1 });
} catch (error) {
  console.error('Falha ao criar cliente postgres', error);
  throw new Error('Não foi possível conectar ao banco de dados externo.');
}

export const externalDb = drizzle(client, {
  schema: { leads, agendamentos, vendedores },
});