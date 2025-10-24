import { useEffect, useCallback, useRef } from 'react'
import { whatsappWebSocket } from '@/lib/whatsapp-websocket'
import { toast } from 'sonner'

interface WhatsAppInstance {
  id: string
  instance_key: string
  evolution_url: string
  evolution_api_key: string
  status: string
}

interface UseWhatsAppRealtimeOptions {
  instance: WhatsAppInstance | null
  onNewMessage?: (data: any) => void
  onMessageUpdate?: (data: any) => void
  onConnectionUpdate?: (data: any) => void
  onQRCodeUpdate?: (data: any) => void
}

/**
 * Hook para conectar e escutar eventos do WhatsApp em tempo real via WebSocket
 */
export function useWhatsAppRealtime({
  instance,
  onNewMessage,
  onMessageUpdate,
  onConnectionUpdate,
  onQRCodeUpdate
}: UseWhatsAppRealtimeOptions) {
  const handlersRef = useRef({ onNewMessage, onMessageUpdate, onConnectionUpdate, onQRCodeUpdate })

  // Atualizar refs quando callbacks mudarem
  useEffect(() => {
    handlersRef.current = { onNewMessage, onMessageUpdate, onConnectionUpdate, onQRCodeUpdate }
  }, [onNewMessage, onMessageUpdate, onConnectionUpdate, onQRCodeUpdate])

  // Conectar/desconectar WebSocket
  useEffect(() => {
    if (!instance || instance.status !== 'connected') {
      // Desconectar se não houver instância ou estiver desconectada
      return
    }

    const { instance_key, evolution_url, evolution_api_key } = instance

    console.log(`[WhatsApp Realtime] Conectando WebSocket para ${instance_key}`)

    // Conectar WebSocket
    whatsappWebSocket.connect(instance_key, evolution_url, evolution_api_key)

    // Registrar handlers
    const handleNewMessage = (data: any) => {
      console.log('[WhatsApp Realtime] Nova mensagem recebida:', data)
      handlersRef.current.onNewMessage?.(data)

      // Toast de notificação apenas para mensagens recebidas (não enviadas)
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((msg: any) => {
          if (!msg.key?.fromMe) {
            const senderName = msg.pushName || msg.key?.remoteJid?.split('@')[0] || 'Desconhecido'
            const content = msg.message?.conversation ||
                           msg.message?.extendedTextMessage?.text ||
                           'Nova mensagem'
            toast.info(`${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`)
          }
        })
      }
    }

    const handleMessageUpdate = (data: any) => {
      console.log('[WhatsApp Realtime] Mensagem atualizada:', data)
      handlersRef.current.onMessageUpdate?.(data)
    }

    const handleConnectionUpdate = (data: any) => {
      console.log('[WhatsApp Realtime] Status de conexão atualizado:', data)
      handlersRef.current.onConnectionUpdate?.(data)

      // Notificar mudanças de conexão
      if (data.state === 'open' || data.connection === 'open') {
        toast.success('WhatsApp conectado!')
      } else if (data.state === 'close' || data.connection === 'close') {
        toast.warning('WhatsApp desconectado')
      }
    }

    const handleQRCodeUpdate = (data: any) => {
      console.log('[WhatsApp Realtime] QR Code atualizado')
      handlersRef.current.onQRCodeUpdate?.(data)
    }

    whatsappWebSocket.on(instance_key, 'messages.upsert', handleNewMessage)
    whatsappWebSocket.on(instance_key, 'messages.update', handleMessageUpdate)
    whatsappWebSocket.on(instance_key, 'connection.update', handleConnectionUpdate)
    whatsappWebSocket.on(instance_key, 'qrcode.updated', handleQRCodeUpdate)

    // Cleanup: desconectar ao desmontar ou trocar instância
    return () => {
      console.log(`[WhatsApp Realtime] Desconectando WebSocket de ${instance_key}`)

      whatsappWebSocket.off(instance_key, 'messages.upsert', handleNewMessage)
      whatsappWebSocket.off(instance_key, 'messages.update', handleMessageUpdate)
      whatsappWebSocket.off(instance_key, 'connection.update', handleConnectionUpdate)
      whatsappWebSocket.off(instance_key, 'qrcode.updated', handleQRCodeUpdate)

      whatsappWebSocket.disconnect(instance_key)
    }
  }, [instance?.id, instance?.status])

  return {
    isConnected: instance ? whatsappWebSocket.isConnected(instance.instance_key) : false
  }
}
