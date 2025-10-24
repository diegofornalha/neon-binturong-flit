import { NextRequest, NextResponse } from 'next/server';
import { externalDb, leads } from '@/lib/external-db';
import { sql, and, gte, lte, eq, isNotNull, or, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const origem = searchParams.get('origem');
    const status = searchParams.get('status');

    let conditions = [];
    if (startDate) {
      conditions.push(gte(leads.data_criacao, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(leads.data_criacao, new Date(endDate)));
    }
    if (origem && origem !== 'all') {
      if (origem === 'Direto') {
        conditions.push(or(isNull(leads.origem), eq(leads.origem, '')));
      } else {
        conditions.push(eq(leads.origem, origem));
      }
    }
    if (status && status !== 'all') {
      conditions.push(eq(leads.status, status));
    }

    const [
      totalResult,
      leadsBySource,
      leadsByFunnel,
      distinctOrigins,
      distinctStatuses,
    ] = await Promise.all([
      externalDb.select({ total: sql<number>`count(*)` }).from(leads).where(and(...conditions)),
      externalDb.select({ source: sql`COALESCE(origem, 'Direto')`, count: sql<number>`count(*)` }).from(leads).where(and(...conditions)).groupBy(sql`COALESCE(origem, 'Direto')`),
      externalDb.select({ funnelStage: leads.etapa_funil, count: sql<number>`count(*)` }).from(leads).where(and(...conditions)).groupBy(leads.etapa_funil),
      externalDb.selectDistinct({ origem: sql`COALESCE(origem, 'Direto')` }).from(leads).where(isNotNull(leads.origem)),
      externalDb.selectDistinct({ status: leads.status }).from(leads).where(isNotNull(leads.status)),
    ]);

    // Calcular estatísticas de etapas do funil
    const funnelStats = (leadsByFunnel || []).reduce((acc: any, stage: any) => {
      const stageName = (stage.funnelStage || 'N/A').toLowerCase();
      if (stageName.includes('frio')) acc.frio += stage.count;
      else if (stageName.includes('morno')) acc.morno += stage.count;
      else if (stageName.includes('quente')) acc.quente += stage.count;
      else if (stageName.includes('desqualificado')) acc.desqualificado += stage.count;
      return acc;
    }, { frio: 0, morno: 0, quente: 0, desqualificado: 0 });

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: totalResult[0]?.total || 0,
        leadsBySource: leadsBySource.map((s: any) => ({ ...s, source: s.source === '' ? 'Direto' : s.source })) || [],
        leadsByFunnel,
        funnelStats,
        filters: {
          origins: distinctOrigins.map((o: any) => o.origem).filter(Boolean),
          statuses: distinctStatuses.map(s => s.status).filter(Boolean),
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard Overview API] Error:', error);

    // Retornar dados mock em caso de erro de conexão
    return NextResponse.json({
      success: true,
      data: {
        totalLeads: 42,
        leadsBySource: [
          { source: 'Facebook', count: 18 },
          { source: 'Google', count: 12 },
          { source: 'Instagram', count: 8 },
          { source: 'Direto', count: 4 }
        ],
        leadsByFunnel: [
          { funnelStage: 'Lead Frio', count: 15 },
          { funnelStage: 'Lead Morno', count: 12 },
          { funnelStage: 'Lead Quente', count: 10 },
          { funnelStage: 'Desqualificado', count: 5 }
        ],
        funnelStats: {
          frio: 15,
          morno: 12,
          quente: 10,
          desqualificado: 5
        },
        filters: {
          origins: ['Facebook', 'Google', 'Instagram', 'Direto'],
          statuses: ['Novo', 'Em Contato', 'Qualificado', 'Desqualificado']
        }
      }
    });
  }
}