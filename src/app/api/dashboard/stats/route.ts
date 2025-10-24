import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_ORGANIZATION_ID } from '@/lib/organization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || DEFAULT_ORGANIZATION_ID;

    // Buscar estatísticas da organização
    const [clientsResult, adAccountsResult, organizationResult] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact' }).eq('organization_id', orgId),
      supabase.from('ad_accounts').select('*', { count: 'exact' }).eq('organization_id', orgId),
      supabase.from('organizations').select('*').eq('id', orgId).single()
    ]);

    if (clientsResult.error) throw clientsResult.error;
    if (adAccountsResult.error) throw adAccountsResult.error;
    if (organizationResult.error) throw organizationResult.error;

    const totalClients = clientsResult.count || 0;
    const totalAdAccounts = adAccountsResult.count || 0;
    const activeClients = clientsResult.data?.filter(c => c.status === 'active').length || 0;
    const connectedAccounts = adAccountsResult.data?.filter(a => a.status === 'connected').length || 0;

    // Calcular taxa de conversão (exemplo: contas conectadas / clientes ativos)
    const conversionRate = activeClients > 0 ? (connectedAccounts / activeClients) * 100 : 0;

    // Agrupar clientes por origem
    const clientSources = (clientsResult.data || []).reduce((acc: any[], client) => {
      const source = (client as any).source || 'Direto';
      const existing = acc.find(s => s.origem === source);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ origem: source, count: 1 });
      }
      return acc;
    }, []);

    const stats = {
      totalClients,
      totalAdAccounts,
      activeClients,
      connectedAccounts,
      conversionRate,
      clientSources,
      organization: organizationResult.data
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[DASHBOARD_STATS_API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}