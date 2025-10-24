import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// GET - Listar chats de uma instância
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar chats ordenados por última mensagem
    const { data, error } = await supabaseAdmin
      .from('whatsapp_chats')
      .select('*')
      .eq('instance_id', instanceId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[WhatsApp Chats API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar chat (marcar como lido, arquivar, etc)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, ...updates } = body

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId é obrigatório' },
        { status: 400 }
      )
    }

    // Permitir apenas atualização de campos específicos
    const allowedFields = ['unread_count', 'is_archived', 'is_pinned', 'is_muted']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const { data, error} = await supabaseAdmin
      .from('whatsapp_chats')
      .update(filteredUpdates)
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[WhatsApp Chats API] PATCH Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
