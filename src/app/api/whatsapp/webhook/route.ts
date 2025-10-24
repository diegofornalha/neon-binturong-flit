import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// POST - Receber eventos do webhook da Evolution API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, instance, data } = body

    console.log(`[Webhook] Evento recebido: ${event} - Instância: ${instance}`)

    // Buscar instância no banco
    const { data: instanceData, error: instanceError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id, organization_id')
      .eq('instance_key', instance)
      .single()

    if (instanceError || !instanceData) {
      console.error('[Webhook] Instância não encontrada:', instance)
      return NextResponse.json({ success: false, error: 'Instância não encontrada' })
    }

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'messages.upsert':
        await handleMessageUpsert(instanceData.id, data)
        break

      case 'messages.update':
        await handleMessageUpdate(instanceData.id, data)
        break

      case 'connection.update':
        await handleConnectionUpdate(instanceData.id, data)
        break

      case 'qrcode.updated':
        await handleQRCodeUpdate(instanceData.id, data)
        break

      default:
        console.log(`[Webhook] Evento não tratado: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Erro:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Handler: Nova mensagem ou mensagem atualizada
async function handleMessageUpsert(instanceId: string, data: any) {
  try {
    const messages = data.messages || []

    for (const msg of messages) {
      const remoteJid = msg.key.remoteJid
      const messageId = msg.key.id
      const fromMe = msg.key.fromMe || false

      // Criar ou atualizar chat
      const { data: chat, error: chatError } = await supabaseAdmin
        .from('whatsapp_chats')
        .upsert({
          instance_id: instanceId,
          remote_jid: remoteJid,
          name: msg.pushName || remoteJid.split('@')[0],
          last_message: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Mídia]',
          last_message_at: new Date(msg.messageTimestamp * 1000).toISOString(),
          chat_type: remoteJid.includes('@g.us') ? 'group' : 'contact',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'instance_id,remote_jid',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (chatError) {
        console.error('[Webhook] Erro ao criar/atualizar chat:', chatError)
        continue
      }

      // Extrair conteúdo da mensagem
      let content = ''
      let messageType = 'text'
      let mediaUrl = null

      if (msg.message?.conversation) {
        content = msg.message.conversation
      } else if (msg.message?.extendedTextMessage) {
        content = msg.message.extendedTextMessage.text
      } else if (msg.message?.imageMessage) {
        content = msg.message.imageMessage.caption || ''
        messageType = 'image'
        mediaUrl = msg.message.imageMessage.url
      } else if (msg.message?.videoMessage) {
        content = msg.message.videoMessage.caption || ''
        messageType = 'video'
        mediaUrl = msg.message.videoMessage.url
      } else if (msg.message?.audioMessage) {
        messageType = 'audio'
        mediaUrl = msg.message.audioMessage.url
      } else if (msg.message?.documentMessage) {
        content = msg.message.documentMessage.fileName || ''
        messageType = 'document'
        mediaUrl = msg.message.documentMessage.url
      }

      // Salvar mensagem
      await supabaseAdmin
        .from('whatsapp_messages')
        .upsert({
          chat_id: chat.id,
          message_id: messageId,
          key_id: msg.key.id,
          from_me: fromMe,
          participant: msg.key.participant,
          message_type: messageType,
          content,
          media_url: mediaUrl,
          status: 'delivered',
          timestamp: new Date(msg.messageTimestamp * 1000).toISOString()
        }, {
          onConflict: 'chat_id,message_id',
          ignoreDuplicates: true
        })

      // Incrementar contador de mensagens não lidas (se não for do usuário)
      if (!fromMe) {
        await supabaseAdmin
          .from('whatsapp_chats')
          .update({
            unread_count: chat.unread_count + 1
          })
          .eq('id', chat.id)
      }
    }

    console.log(`[Webhook] ${messages.length} mensagens processadas`)
  } catch (error) {
    console.error('[Webhook] Erro ao processar mensagens:', error)
  }
}

// Handler: Mensagem atualizada (lida, deletada, etc)
async function handleMessageUpdate(instanceId: string, data: any) {
  try {
    const updates = data.messages || []

    for (const update of updates) {
      const messageId = update.key.id
      const status = update.update?.status

      if (status) {
        await supabaseAdmin
          .from('whatsapp_messages')
          .update({ status })
          .eq('message_id', messageId)
      }
    }

    console.log(`[Webhook] ${updates.length} mensagens atualizadas`)
  } catch (error) {
    console.error('[Webhook] Erro ao atualizar mensagens:', error)
  }
}

// Handler: Atualização de conexão
async function handleConnectionUpdate(instanceId: string, data: any) {
  try {
    const state = data.state || data.connection

    let status = 'disconnected'
    if (state === 'open') status = 'connected'
    else if (state === 'connecting') status = 'connecting'
    else if (state === 'close') status = 'disconnected'

    await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status,
        ...(status === 'connected' && {
          connected_at: new Date().toISOString(),
          phone: data.user?.id?.split(':')[0]
        })
      })
      .eq('id', instanceId)

    console.log(`[Webhook] Status de conexão atualizado: ${status}`)
  } catch (error) {
    console.error('[Webhook] Erro ao atualizar conexão:', error)
  }
}

// Handler: QR Code atualizado
async function handleQRCodeUpdate(instanceId: string, data: any) {
  try {
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        qr_code: data.qrcode || data.base64,
        status: 'qrcode'
      })
      .eq('id', instanceId)

    console.log('[Webhook] QR Code atualizado')
  } catch (error) {
    console.error('[Webhook] Erro ao atualizar QR Code:', error)
  }
}
