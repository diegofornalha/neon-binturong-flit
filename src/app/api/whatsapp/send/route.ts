import { NextRequest, NextResponse } from 'next/server';

const EVOLUTION_URL = 'https://evolutionlgpd.nexusunlimited.io';
const INSTANCE = 'carmen-sdr-triton';
const API_KEY = 'EAAKr358KxhMBPc3TZAn9ZCDUTr6YIXmspBmzLZBSaXJg0ksBvH90Sk6HvowTSMHFSApKMFrdek8mpkWpYOvlYZB9kRZCGMLvLHZAMhLDuGXrY4yS629ua57PZBKfZA7rjZB09yflOWbAZCtdBu7juIiMQvWRXM91jvkdjRZCbzD2SeAWp14a4CKuROvlAJivWhR3wZDZD';

export async function POST(request: NextRequest) {
  try {
    const { number, text } = await request.json();
    if (!number || !text) {
      return NextResponse.json({ success: false, error: 'number e text são obrigatórios' }, { status: 400 });
    }

    const body = JSON.stringify({
      number: number.replace(/\D/g, ''), // Sanitiza o número
      text,
    });

    const response = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
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