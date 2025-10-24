import { NextResponse } from 'next/server';
import { externalDb, agendamentos, leads, vendedores } from '@/lib/external-db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allAppointments = await externalDb
      .select({
        appointment: {
          id: agendamentos.id,
          lead_id: agendamentos.lead_id,
          vendedor_id: agendamentos.vendedor_id,
          veiculo: agendamentos.veiculo,
          data_agendamento: agendamentos.data_agendamento,
          status: agendamentos.status,
          tipo_agendamento: agendamentos.tipo_agendamento,
          observacoes: agendamentos.observacoes,
          cliente_nome: agendamentos.cliente_nome,
          cliente_telefone: agendamentos.cliente_telefone,
          created_at: agendamentos.created_at,
          updated_at: agendamentos.updated_at,
        },
        lead: {
          id: leads.id,
          nome_completo: leads.nome_completo,
          email: leads.email,
          telefone: leads.telefone,
          data_criacao: leads.data_criacao,
          etapa_funil: leads.etapa_funil,
        },
        vendedor: {
          id: vendedores.id,
          nome: vendedores.nome,
        }
      })
      .from(agendamentos)
      .leftJoin(leads, eq(agendamentos.lead_id, leads.id))
      .leftJoin(vendedores, eq(agendamentos.vendedor_id, vendedores.id));

    return NextResponse.json(allAppointments);
  } catch (error) {
    console.error('[APPOINTMENTS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}