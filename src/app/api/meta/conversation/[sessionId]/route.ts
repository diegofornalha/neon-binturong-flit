import { NextRequest, NextResponse } from 'next/server';
import { externalDb, leads } from '@/lib/external-db';
import { getDb } from '@/lib/database';
import { eq } from 'drizzle-orm';

const META_API_URL = 'https://graph.facebook.com/v18.0';

async function fetchMetaConversation(psid: string, pageId: string, accessToken: string) {
  const conversationUrl = `${META_API_URL}/${pageId}/conversations?user_id=${psid}&access_token=${accessToken}`;
  const convResponse = await fetch(conversationUrl);
  const convData = await convResponse.json();

  if (!convResponse.ok || convData.error || !convData.data || convData.data.length === 0) {
    console.error('Meta API Error (finding conversation):', convData.error);
    throw new Error(convData.error?.message || 'Não foi possível encontrar a conversa para este usuário.');
  }

  const conversationId = convData.data[0].id;

  const messagesUrl = `${META_API_URL}/${conversationId}/messages?fields=id,from,message,created_time&access_token=${accessToken}`;
  const messagesResponse = await fetch(messagesUrl);
  const messagesData = await messagesResponse.json();

  if (!messagesResponse.ok || messagesData.error) {
    console.error('Meta API Error (fetching messages):', messagesData.error);
    throw new Error(messagesData.error?.message || 'Falha ao buscar mensagens da conversa.');
  }

  return {
    messages: (messagesData.data || []).map((msg: any) => ({
      id: msg.id,
      from: msg.from,
      message: msg.message,
      timestamp: msg.created_time,
    })).reverse(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  try {
    const db = await getDb();
    const settings = db.data.settings?.facebook;
    const accessToken = settings?.accessToken;
    const pageId = process.env.META_PAGE_ID || '622565781186400';

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Access Token do Facebook não configurado.' }, { status: 400 });
    }

    const leadResult = await externalDb
      .select({
        nome_completo: leads.nome_completo,
        facebook_user_id: leads.facebook_user_id,
        origem: leads.origem,
      })
      .from(leads)
      .where(eq(leads.sessionid_principal, sessionId))
      .limit(1);

    if (leadResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Lead não encontrado' }, { status: 404 });
    }

    const lead = leadResult[0];
    const psid = lead.facebook_user_id;
    const origin = lead.origem?.toLowerCase() || '';
    let platform = 'outra';
    if (origin.includes('instagram')) platform = 'instagram';
    if (origin.includes('facebook')) platform = 'facebook';

    if (!psid) {
      return NextResponse.json({ success: false, message: 'Este lead não possui um ID de usuário do Facebook (PSID) para buscar a conversa.' }, { status: 400 });
    }

    const conversation = await fetchMetaConversation(psid, pageId, accessToken);

    return NextResponse.json({
      success: true,
      data: {
        messages: conversation.messages,
        leadInfo: { name: lead.nome_completo, platform },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Erro interno' }, { status: 500 });
  }
}