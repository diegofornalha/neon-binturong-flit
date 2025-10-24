"use client"

import { useState, useEffect, useRef } from "react";
import { Loader2, MessageSquareOff, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatSourceName } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConversationViewerProps {
  lead: any;
}

const META_ORIGINS = [
  'facebook_messenger_chatwoot',
  'instagram_direct',
  'instagram_comment',
  'instagram_comentario',
];

function isMetaOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return META_ORIGINS.includes(origin.toLowerCase());
}

export function ConversationViewer({ lead }: ConversationViewerProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lead?.sessionid_principal && isMetaOrigin(lead.origem)) {
      const fetchConversation = async () => {
        setLoading(true);
        setConversation(null);
        try {
          const response = await fetch(`/api/meta/conversation/${lead.sessionid_principal}`);
          const data = await response.json();
          if (!data.success) throw new Error(data.message);
          setConversation(data.data);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao carregar a conversa.");
        } finally {
          setLoading(false);
        }
      };
      fetchConversation();
    } else {
      setConversation(null);
    }
  }, [lead]);

  // Auto-scroll para o final das mensagens
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [conversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !lead?.facebook_user_id) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/meta/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: lead.facebook_user_id,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setConversation((prev: any) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { id: new Date().toISOString(), from: { name: 'Você' }, message: newMessage, timestamp: new Date().toISOString() }
        ]
      }));
      setNewMessage("");
      toast.success("Mensagem enviada!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isMetaOrigin(lead.origem)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
        <MessageSquareOff className="h-12 w-12 mb-4" />
        <h3 className="font-semibold text-white">Conversa não disponível</h3>
        <p className="text-sm">
          Origem deste lead: <strong>{formatSourceName(lead.origem)}</strong>
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" /></div>;
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-full text-gray-500">Nenhuma conversa encontrada para este lead.</div>;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex-shrink-0">Conversa com {conversation.leadInfo.name}</h3>
      <ScrollArea className="flex-1 -mx-4" ref={scrollAreaRef}>
        <div className="px-4 space-y-4 pb-4">
          {conversation.messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.from.name !== conversation.leadInfo.name ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.from.name !== conversation.leadInfo.name ? 'bg-nexus-blue text-white' : 'bg-nexus-secondary text-gray-300'}`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 flex-shrink-0">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="bg-nexus-darker border-cyan-500/20"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}