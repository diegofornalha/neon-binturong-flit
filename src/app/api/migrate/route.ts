import { NextRequest, NextResponse } from 'next/server';
import { MigrationHelper } from '@/lib/migration-helper';

/**
 * Endpoint para executar migração de dados
 * 
 * IMPORTANTE: Este endpoint deve ser protegido em produção!
 * Adicione autenticação ou remova após migração.
 */
export async function POST(request: NextRequest) {
  try {
    // Proteção básica - em produção, use autenticação real
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET || 'change-me-in-production';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid migration token' },
        { status: 401 }
      );
    }
    
    console.log('[Migration API] Iniciando migração via API...');
    
    // Executa migração
    await MigrationHelper.runAllMigrations();
    
    return NextResponse.json({
      success: true,
      message: 'Migração concluída com sucesso! Dados existentes foram preservados.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Migration API] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Migração falhou. Dados existentes NÃO foram afetados.'
    }, { status: 500 });
  }
}

// Endpoint para verificar status da migração
export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db-tenant');
    const { migrations } = await import('@/lib/schema-tenant');
    
    const allMigrations = await db.select().from(migrations);
    
    return NextResponse.json({
      success: true,
      migrations: allMigrations,
      summary: {
        total: allMigrations.length,
        completed: allMigrations.filter(m => m.status === 'completed').length,
        pending: allMigrations.filter(m => m.status === 'pending').length,
        failed: allMigrations.filter(m => m.status === 'failed').length
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}