import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// POST - Conectar instância e obter QR Code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceId } = body

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados da instância
    const { data: instance, error: fetchError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (fetchError || !instance) {
      return NextResponse.json(
        { success: false, error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // 1. Criar/Conectar instância na Evolution API
    try {
      const createResponse = await fetch(`${instance.evolution_url}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': instance.evolution_api_key
        },
        body: JSON.stringify({
          instanceName: instance.instance_key,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error('[Evolution API] Create instance error:', errorData)
      }
    } catch (createError) {
      console.log('[Evolution API] Instance may already exist, continuing...')
    }

    // 2. Conectar instância
    const connectResponse = await fetch(`${instance.evolution_url}/instance/connect/${instance.instance_key}`, {
      method: 'GET',
      headers: {
        'apikey': instance.evolution_api_key
      }
    })

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text()
      throw new Error(`Erro ao conectar instância: ${errorText}`)
    }

    const connectData = await connectResponse.json()

    // 3. Buscar QR Code
    const qrResponse = await fetch(`${instance.evolution_url}/instance/qrcode/${instance.instance_key}`, {
      method: 'GET',
      headers: {
        'apikey': instance.evolution_api_key
      }
    })

    let qrCode = null
    if (qrResponse.ok) {
      const qrData = await qrResponse.json()
      qrCode = qrData.qrcode || qrData.base64 || null
    }

    // 4. Atualizar status no banco
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status: qrCode ? 'qrcode' : 'connecting',
        qr_code: qrCode
      })
      .eq('id', instanceId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
      qrCode,
      message: qrCode ? 'QR Code gerado' : 'Aguardando conexão'
    })
  } catch (error) {
    console.error('[WhatsApp Connect API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
