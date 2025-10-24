import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

const META_API_URL = 'https://graph.facebook.com/v18.0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, message } = body;

    if (!recipientId || !message) {
      return NextResponse.json({ success: false, message: 'ID do destinatário e mensagem são obrigatórios.' }, { status: 400 });
    }

    const db = await getDb();
    const accessToken = db.data.settings?.facebook?.accessToken;
    const pageId = process.env.META_PAGE_ID || '622565781186400'; // Fallback

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Access Token do Facebook não configurado.' }, { status: 400 });
    }

    const url = `${META_API_URL}/me/messages?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: { id: recipientId },
        message: { text: message },
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Meta API Error (sending message):', data.error);
      throw new Error(data.error?.message || 'Falha ao enviar mensagem.');
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Erro interno' }, { status: 500 });
  }
}