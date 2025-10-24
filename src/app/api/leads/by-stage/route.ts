import { NextRequest, NextResponse } from 'next/server';
import { externalDb, leads } from '@/lib/external-db';
import { ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    if (!stage) {
      return NextResponse.json({ success: false, error: 'Etapa do funil não especificada' }, { status: 400 });
    }

    // Tornando a busca case-insensitive e removendo "lead_" do início
    const searchTerm = stage.replace(/^lead_/, '');

    const leadsInStage = await externalDb
      .select()
      .from(leads)
      .where(ilike(leads.etapa_funil, `%${searchTerm}%`));

    return NextResponse.json({ success: true, data: leadsInStage });
  } catch (error) {
    console.error('[Leads by Stage API] Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar leads' }, { status: 500 });
  }
}