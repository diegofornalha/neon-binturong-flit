import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// GET - Listar mensagens de um chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar mensagens ordenadas por timestamp (mais recentes primeiro)
    const { data, error, count } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('[WhatsApp Messages API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceId, remoteJid, content, messageType = 'text' } = body

    if (!instanceId || !remoteJid || !content) {
      return NextResponse.json(
        { success: false, error: 'instanceId, remoteJid e content são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar dados da instância
    const { data: instance, error: instanceError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { success: false, error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // Enviar mensagem via Evolution API
    const sendResponse = await fetch(`${instance.evolution_url}/message/sendText/${instance.instance_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': instance.evolution_api_key
      },
      body: JSON.stringify({
        number: remoteJid.split('@')[0],
        text: content
      })
    })

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text()
      throw new Error(`Erro ao enviar mensagem: ${errorText}`)
    }

    const sendData = await sendResponse.json()

    // Buscar ou criar chat
    const { data: chat } = await supabaseAdmin
      .from('whatsapp_chats')
      .upsert({
        instance_id: instanceId,
        remote_jid: remoteJid,
        name: remoteJid.split('@')[0],
        last_message: content,
        last_message_at: new Date().toISOString(),
        chat_type: remoteJid.includes('@g.us') ? 'group' : 'contact',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'instance_id,remote_jid',
        ignoreDuplicates: false
      })
      .select()
      .single()

    // Salvar mensagem no banco
    const { data: message, error: messageError } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        chat_id: chat.id,
        message_id: sendData.key?.id || crypto.randomUUID(),
        key_id: sendData.key?.id,
        from_me: true,
        message_type: messageType,
        content,
        status: 'sent',
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (messageError) throw messageError

    return NextResponse.json({
      success: true,
      data: message,
      evolutionResponse: sendData
    })
  } catch (error) {
    console.error('[WhatsApp Messages API] POST Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
