import { io, Socket } from 'socket.io-client'

interface WebSocketMessage {
  instanceKey: string
  event: string
  data: any
}

class WhatsAppWebSocketManager {
  private connections: Map<string, Socket> = new Map()
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()

  /**
   * Conectar a uma instância WhatsApp via WebSocket
   */
  connect(instanceKey: string, evolutionUrl: string, apiKey: string) {
    // Se já estiver conectado, retornar conexão existente
    if (this.connections.has(instanceKey)) {
      console.log(`[WebSocket] Instância ${instanceKey} já conectada`)
      return this.connections.get(instanceKey)
    }

    console.log(`[WebSocket] Conectando à instância ${instanceKey}...`)

    // Criar conexão WebSocket
    const socket = io(evolutionUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        apikey: apiKey
      },
      query: {
        instance: instanceKey
      }
    })

    // Eventos de conexão
    socket.on('connect', () => {
      console.log(`[WebSocket] Conectado à instância ${instanceKey}`)
    })

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Desconectado da instância ${instanceKey}`)
    })

    socket.on('error', (error) => {
      console.error(`[WebSocket] Erro na instância ${instanceKey}:`, error)
    })

    // Escutar eventos do WhatsApp
    this.setupEventListeners(socket, instanceKey)

    // Salvar conexão
    this.connections.set(instanceKey, socket)

    return socket
  }

  /**
   * Configurar listeners para eventos do WhatsApp
   */
  private setupEventListeners(socket: Socket, instanceKey: string) {
    // Evento: Nova mensagem recebida/enviada
    socket.on('messages.upsert', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Nova mensagem:`, data)
      this.triggerHandlers(`${instanceKey}:messages.upsert`, data)
    })

    // Evento: Mensagem atualizada (lida, deletada, etc)
    socket.on('messages.update', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Mensagem atualizada:`, data)
      this.triggerHandlers(`${instanceKey}:messages.update`, data)
    })

    // Evento: Atualização de contato
    socket.on('contacts.update', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Contato atualizado:`, data)
      this.triggerHandlers(`${instanceKey}:contacts.update`, data)
    })

    // Evento: QR Code atualizado
    socket.on('qrcode.updated', (data) => {
      console.log(`[WebSocket] ${instanceKey} - QR Code atualizado`)
      this.triggerHandlers(`${instanceKey}:qrcode.updated`, data)
    })

    // Evento: Status de conexão mudou
    socket.on('connection.update', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Conexão atualizada:`, data)
      this.triggerHandlers(`${instanceKey}:connection.update`, data)
    })

    // Evento: Presença (online/offline/typing)
    socket.on('presence.update', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Presença atualizada:`, data)
      this.triggerHandlers(`${instanceKey}:presence.update`, data)
    })

    // Evento: Chamada
    socket.on('call', (data) => {
      console.log(`[WebSocket] ${instanceKey} - Chamada:`, data)
      this.triggerHandlers(`${instanceKey}:call`, data)
    })
  }

  /**
   * Desconectar de uma instância
   */
  disconnect(instanceKey: string) {
    const socket = this.connections.get(instanceKey)
    if (socket) {
      console.log(`[WebSocket] Desconectando instância ${instanceKey}`)
      socket.disconnect()
      this.connections.delete(instanceKey)
      this.messageHandlers.delete(instanceKey)
    }
  }

  /**
   * Desconectar de todas as instâncias
   */
  disconnectAll() {
    console.log('[WebSocket] Desconectando todas as instâncias')
    this.connections.forEach((socket, key) => {
      socket.disconnect()
    })
    this.connections.clear()
    this.messageHandlers.clear()
  }

  /**
   * Registrar handler para evento específico
   */
  on(instanceKey: string, event: string, handler: (data: any) => void) {
    const key = `${instanceKey}:${event}`
    const handlers = this.messageHandlers.get(key) || []
    handlers.push(handler)
    this.messageHandlers.set(key, handlers)
  }

  /**
   * Remover handler de evento
   */
  off(instanceKey: string, event: string, handler: (data: any) => void) {
    const key = `${instanceKey}:${event}`
    const handlers = this.messageHandlers.get(key) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
      this.messageHandlers.set(key, handlers)
    }
  }

  /**
   * Disparar todos os handlers registrados para um evento
   */
  private triggerHandlers(key: string, data: any) {
    const handlers = this.messageHandlers.get(key) || []
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error(`[WebSocket] Erro ao executar handler:`, error)
      }
    })
  }

  /**
   * Verificar se instância está conectada
   */
  isConnected(instanceKey: string): boolean {
    const socket = this.connections.get(instanceKey)
    return socket?.connected || false
  }

  /**
   * Obter todas as conexões ativas
   */
  getActiveConnections(): string[] {
    return Array.from(this.connections.keys())
  }
}

// Singleton global
export const whatsappWebSocket = new WhatsAppWebSocketManager()
