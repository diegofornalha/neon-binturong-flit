import { db } from './db-tenant';
import { organizations, users, clients, migrations } from './schema-tenant';
import { usuarios, leads, agendamentos } from './schema';
import { eq } from 'drizzle-orm';

/**
 * MIGRAÇÃO SEGURA - NÃO DELETA DADOS EXISTENTES
 * 
 * Estratégia:
 * 1. Cria organização padrão para dados existentes
 * 2. Migra usuários existentes para nova tabela
 * 3. Mantém tabelas antigas intactas como backup
 */

export class MigrationHelper {
  
  /**
   * Verifica se a migração já foi executada
   */
  static async isMigrationCompleted(tableName: string): Promise<boolean> {
    const result = await db.select()
      .from(migrations)
      .where(eq(migrations.tableName, tableName))
      .limit(1);
    
    return result.length > 0 && result[0].status === 'completed';
  }

  /**
   * Cria organização padrão para dados existentes
   */
  static async createDefaultOrganization(): Promise<number> {
    console.log('[Migration] Criando organização padrão para dados existentes...');
    
    // Verifica se já existe
    const existing = await db.select()
      .from(organizations)
      .where(eq(organizations.slug, 'default-org'))
      .limit(1);
    
    if (existing.length > 0) {
      console.log('[Migration] Organização padrão já existe:', existing[0].id);
      return existing[0].id;
    }
    
    // Cria nova organização
    const [org] = await db.insert(organizations).values({
      name: 'Organização Principal',
      slug: 'default-org',
      plan: 'enterprise', // Dados existentes ganham plano enterprise
      status: 'active',
      limits: {
        maxClients: 999,
        maxAdAccounts: 999,
        maxUsers: 999,
        dataRetentionDays: 999,
        reportsPerMonth: 999
      }
    }).returning();
    
    console.log('[Migration] Organização padrão criada:', org.id);
    return org.id;
  }

  /**
   * Migra usuários da tabela antiga para nova (SEM DELETAR)
   */
  static async migrateUsers(organizationId: number): Promise<void> {
    const migrationName = 'usuarios_to_users';
    
    if (await this.isMigrationCompleted(migrationName)) {
      console.log('[Migration] Usuários já foram migrados anteriormente');
      return;
    }
    
    console.log('[Migration] Iniciando migração de usuários...');
    
    // Registra início da migração
    const [migrationRecord] = await db.insert(migrations).values({
      tableName: migrationName,
      status: 'in_progress',
      startedAt: new Date()
    }).returning();
    
    try {
      // Busca usuários da tabela antiga
      const oldUsers = await db.select().from(usuarios);
      
      console.log(`[Migration] Encontrados ${oldUsers.length} usuários para migrar`);
      
      let migrated = 0;
      
      for (const oldUser of oldUsers) {
        // Verifica se já foi migrado (por email)
        const existing = await db.select()
          .from(users)
          .where(eq(users.email, oldUser.email))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`[Migration] Usuário ${oldUser.email} já existe na nova tabela`);
          continue;
        }
        
        // Migra para nova tabela
        await db.insert(users).values({
          organizationId,
          email: oldUser.email,
          senha: oldUser.senha,
          role: oldUser.nivel === 1 ? 'owner' : 'member',
          isActive: true,
          createdAt: oldUser.createdAt || new Date()
        });
        
        migrated++;
        console.log(`[Migration] Usuário ${oldUser.email} migrado com sucesso`);
      }
      
      // Atualiza registro de migração
      await db.update(migrations)
        .set({
          status: 'completed',
          recordsMigrated: migrated,
          totalRecords: oldUsers.length,
          completedAt: new Date()
        })
        .where(eq(migrations.id, migrationRecord.id));
      
      console.log(`[Migration] Migração de usuários concluída: ${migrated}/${oldUsers.length}`);
      
    } catch (error) {
      console.error('[Migration] Erro ao migrar usuários:', error);
      
      await db.update(migrations)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
        .where(eq(migrations.id, migrationRecord.id));
      
      throw error;
    }
  }

  /**
   * Migra leads para clientes (SEM DELETAR)
   */
  static async migrateLeadsToClients(organizationId: number): Promise<void> {
    const migrationName = 'leads_to_clients';
    
    if (await this.isMigrationCompleted(migrationName)) {
      console.log('[Migration] Leads já foram migrados anteriormente');
      return;
    }
    
    console.log('[Migration] Iniciando migração de leads para clientes...');
    
    const [migrationRecord] = await db.insert(migrations).values({
      tableName: migrationName,
      status: 'in_progress',
      startedAt: new Date()
    }).returning();
    
    try {
      const oldLeads = await db.select().from(leads);
      
      console.log(`[Migration] Encontrados ${oldLeads.length} leads para migrar`);
      
      let migrated = 0;
      
      for (const lead of oldLeads) {
        if (!lead.email) continue; // Pula leads sem email
        
        // Verifica se já existe
        const existing = await db.select()
          .from(clients)
          .where(eq(clients.email, lead.email))
          .limit(1);
        
        if (existing.length > 0) continue;
        
        // Migra para clientes
        await db.insert(clients).values({
          organizationId,
          name: lead.nome || 'Lead sem nome',
          email: lead.email,
          status: 'active',
          settings: {
            language: 'pt'
          },
          createdAt: lead.createdAt || new Date()
        });
        
        migrated++;
      }
      
      await db.update(migrations)
        .set({
          status: 'completed',
          recordsMigrated: migrated,
          totalRecords: oldLeads.length,
          completedAt: new Date()
        })
        .where(eq(migrations.id, migrationRecord.id));
      
      console.log(`[Migration] Migração de leads concluída: ${migrated}/${oldLeads.length}`);
      
    } catch (error) {
      console.error('[Migration] Erro ao migrar leads:', error);
      
      await db.update(migrations)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
        .where(eq(migrations.id, migrationRecord.id));
      
      throw error;
    }
  }

  /**
   * Executa todas as migrações de forma segura
   */
  static async runAllMigrations(): Promise<void> {
    console.log('[Migration] ========================================');
    console.log('[Migration] INICIANDO MIGRAÇÃO SEGURA MULTI-TENANT');
    console.log('[Migration] ========================================');
    console.log('[Migration] IMPORTANTE: Dados existentes NÃO serão deletados');
    console.log('[Migration] ========================================\n');
    
    try {
      // 1. Cria organização padrão
      const orgId = await this.createDefaultOrganization();
      
      // 2. Migra usuários
      await this.migrateUsers(orgId);
      
      // 3. Migra leads para clientes
      await this.migrateLeadsToClients(orgId);
      
      console.log('\n[Migration] ========================================');
      console.log('[Migration] MIGRAÇÃO CONCLUÍDA COM SUCESSO! ✅');
      console.log('[Migration] ========================================');
      console.log('[Migration] Próximos passos:');
      console.log('[Migration] 1. Verifique os dados na nova estrutura');
      console.log('[Migration] 2. Tabelas antigas permanecem intactas como backup');
      console.log('[Migration] 3. Sistema agora suporta multi-tenant');
      console.log('[Migration] ========================================\n');
      
    } catch (error) {
      console.error('\n[Migration] ========================================');
      console.error('[Migration] ERRO NA MIGRAÇÃO ❌');
      console.error('[Migration] ========================================');
      console.error('[Migration] Erro:', error);
      console.error('[Migration] Dados existentes NÃO foram afetados');
      console.error('[Migration] ========================================\n');
      throw error;
    }
  }
}