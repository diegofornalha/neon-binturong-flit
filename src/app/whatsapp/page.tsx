"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useWhatsApp } from '@/components/providers/whatsapp-provider'
import { useWhatsAppRealtime } from '@/hooks/use-whatsapp-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MessageSquare,
  Send,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  remote_jid: string
  name: string
  last_message: string
  last_message_at: string
  unread_count: number
  chat_type: 'contact' | 'group'
}

interface Message {
  id: string
  message_id: string
  from_me: boolean
  message_type: string
  content: string
  status: string
  timestamp: string
}

export default function WhatsAppPage() {
  const { organization } = useAuth()
  const { activeInstance, loadInstances } = useWhatsApp()

  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // WebSocket handlers
  const handleNewMessage = useCallback((data: any) => {
    console.log('[WhatsApp Page] Nova mensagem via WebSocket:', data)

    // Recarregar chats para atualizar última mensagem e contador
    loadChats()

    // Se a mensagem for do chat selecionado, adicionar à lista de mensagens
    if (selectedChat && data.messages) {
      data.messages.forEach((msg: any) => {
        const remoteJid = msg.key?.remoteJid
        if (remoteJid === selectedChat.remote_jid) {
          // Adicionar mensagem à lista
          const newMessage: Message = {
            id: msg.key?.id || crypto.randomUUID(),
            message_id: msg.key?.id || '',
            from_me: msg.key?.fromMe || false,
            message_type: 'text',
            content: msg.message?.conversation ||
                     msg.message?.extendedTextMessage?.text ||
                     '[Mídia]',
            status: 'delivered',
            timestamp: new Date(msg.messageTimestamp * 1000).toISOString()
          }

          setMessages(prev => {
            // Evitar duplicatas
            if (prev.find(m => m.message_id === newMessage.message_id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      })
    }
  }, [selectedChat?.remote_jid])

  const handleMessageUpdate = useCallback((data: any) => {
    console.log('[WhatsApp Page] Atualização de mensagem via WebSocket:', data)

    // Atualizar status das mensagens
    if (data.messages) {
      data.messages.forEach((update: any) => {
        const messageId = update.key?.id
        const status = update.update?.status

        if (messageId && status) {
          setMessages(prev => prev.map(msg =>
            msg.message_id === messageId ? { ...msg, status } : msg
          ))
        }
      })
    }
  }, [])

  const handleConnectionUpdate = useCallback((data: any) => {
    console.log('[WhatsApp Page] Conexão atualizada via WebSocket:', data)
    // Recarregar instâncias para atualizar status
    loadInstances()
  }, [loadInstances])

  // Conectar WebSocket em tempo real
  const { isConnected } = useWhatsAppRealtime({
    instance: activeInstance,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate,
    onConnectionUpdate: handleConnectionUpdate
  })

  // Carregar chats quando instância ativa mudar
  useEffect(() => {
    if (activeInstance?.id) {
      loadChats()
    } else {
      setChats([])
      setSelectedChat(null)
    }
  }, [activeInstance?.id])

  // Carregar mensagens quando chat for selecionado
  useEffect(() => {
    if (selectedChat?.id) {
      loadMessages(selectedChat.id)
    } else {
      setMessages([])
    }
  }, [selectedChat?.id])

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChats = async () => {
    if (!activeInstance?.id) return

    try {
      setLoadingChats(true)
      const response = await fetch(`/api/whatsapp/chats?instanceId=${activeInstance.id}`)
      const data = await response.json()

      if (data.success) {
        setChats(data.data || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsApp Page] Error loading chats:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      setLoadingChats(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/whatsapp/messages?chatId=${chatId}&limit=100`)
      const data = await response.json()

      if (data.success) {
        // Ordenar mensagens por timestamp (mais antigas primeiro)
        const sortedMessages = (data.data || []).sort((a: Message, b: Message) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        setMessages(sortedMessages)

        // Marcar chat como lido (zerar contador)
        await fetch('/api/whatsapp/chats', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            unread_count: 0
          })
        })

        // Atualizar chat na lista local
        setChats(prev => prev.map(chat =>
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        ))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsApp Page] Error loading messages:', error)
      toast.error('Erro ao carregar mensagens')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || !selectedChat || !activeInstance) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      message_id: `temp-${Date.now()}`,
      from_me: true,
      message_type: 'text',
      content: messageText,
      status: 'pending',
      timestamp: new Date().toISOString()
    }

    try {
      setSendingMessage(true)

      // Adicionar mensagem temporária
      setMessages(prev => [...prev, tempMessage])
      const currentMessage = messageText
      setMessageText('')

      const response = await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId: activeInstance.id,
          remoteJid: selectedChat.remote_jid,
          content: currentMessage,
          messageType: 'text'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Substituir mensagem temporária pela real
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? data.data : msg
        ))

        // Atualizar última mensagem do chat
        setChats(prev => prev.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, last_message: currentMessage, last_message_at: new Date().toISOString() }
            : chat
        ))
      } else {
        // Remover mensagem temporária em caso de erro
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        setMessageText(currentMessage)
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[WhatsApp Page] Error sending message:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getStatusIcon = (status: string, fromMe: boolean) => {
    if (!fromMe) return null

    switch (status) {
      case 'pending':
        return <Circle className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-gray-500" />
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-gray-500" />
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />
      default:
        return <Circle className="h-3 w-3 text-gray-400" />
    }
  }

  if (!activeInstance) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-100">Nenhuma instância ativa</h3>
              <p className="text-sm text-slate-400">
                Selecione uma instância WhatsApp no menu lateral ou configure uma nova em Settings → WhatsApp
              </p>
              <Button onClick={loadInstances} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Instâncias
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Lista de Chats - Lateral Esquerda */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Conversas
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant={activeInstance.status === 'connected' ? 'default' : 'secondary'}>
                {activeInstance.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </Badge>
              {isConnected && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Circle className="h-2 w-2 fill-green-600 mr-1" />
                  Real-time
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={loadChats}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        <ScrollArea className="flex-1">
          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4 text-muted-foreground">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors",
                  selectedChat?.id === chat.id && "bg-blue-50 hover:bg-blue-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(chat.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(chat.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {chat.last_message || 'Sem mensagens'}
                      </p>
                      {chat.unread_count > 0 && (
                        <Badge className="ml-2 bg-blue-600 flex-shrink-0">
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Área de Mensagens - Direita */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(selectedChat.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.remote_jid}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4 bg-slate-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma mensagem ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp)

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <Badge variant="secondary" className="text-xs">
                              {formatDate(message.timestamp)}
                            </Badge>
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex",
                            message.from_me ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              message.from_me
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200"
                            )}
                          >
                            <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              <span className={cn(
                                "text-xs",
                                message.from_me ? "text-blue-100" : "text-muted-foreground"
                              )}>
                                {formatTime(message.timestamp)}
                              </span>
                              {getStatusIcon(message.status, message.from_me)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sendingMessage || activeInstance.status !== 'connected'}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim() || activeInstance.status !== 'connected'}
                  className="px-6"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {activeInstance.status !== 'connected' && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Instância desconectada. Conecte em Settings → WhatsApp para enviar mensagens.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
