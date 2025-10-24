import { NextRequest, NextResponse } from 'next/server';

const EVOLUTION_URL = 'https://evolutionlgpd.nexusunlimited.io';
const INSTANCE = 'carmen-sdr-triton';
const API_KEY = 'EAAKr358KxhMBPc3TZAn9ZCDUTr6YIXmspBmzLZBSaXJg0ksBvH90Sk6HvowTSMHFSApKMFrdek8mpkWpYOvlYZB9kRZCGMLvLHZAMhLDuGXrY4yS629ua57PZBKfZA7rjZB09yflOWbAZCtdBu7juIiMQvWRXM91jvkdjRZCbzD2SeAWp14a4CKuROvlAJivWhR3wZDZD';

export async function POST(request: NextRequest) {
  try {
    const { remoteJid, id, fromMe } = await request.json();
    if (!remoteJid || !id || fromMe === undefined) {
      return NextResponse.json({ success: false, error: 'remoteJid, id e fromMe são obrigatórios' }, { status: 400 });
    }

    const body = JSON.stringify({
      remoteJid,
      id,
      fromMe,
    });

    const response = await fetch(`${EVOLUTION_URL}/message/delete/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body,
    });

    const responseText = await response.text();
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: 'Resposta inválida da API' };
      }
      return NextResponse.json({ success: false, error: errorData.error || response.statusText }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}