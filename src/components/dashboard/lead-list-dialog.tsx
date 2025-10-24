"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Mail, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { formatFunnelStageName } from "@/lib/formatters";
import { ConversationViewer } from "./conversation-viewer";

interface LeadListDialogProps {
  stage: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadListDialog({ stage, open, onOpenChange }: LeadListDialogProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    if (stage && open) {
      const fetchLeads = async () => {
        setLoading(true);
        setSelectedLead(null);
        try {
          const response = await fetch(`/api/leads/by-stage?stage=${stage}`);
          const data = await response.json();
          if (!data.success) throw new Error(data.error);
          setLeads(data.data);
        } catch (error) {
          toast.error("Erro ao buscar leads da etapa.");
        } finally {
          setLoading(false);
        }
      };
      fetchLeads();
    }
  }, [stage, open]);

  if (!stage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] md:h-[80vh] flex flex-col bg-nexus-secondary border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Leads na Etapa: {formatFunnelStageName(stage)}</DialogTitle>
          <DialogDescription>{leads.length} leads encontrados nesta etapa.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Coluna da Lista de Leads */}
          <div className="flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" />
                </div>
              ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <Search className="h-12 w-12 mb-4" />
                  <h3 className="font-semibold">Nenhum lead encontrado</h3>
                  <p className="text-sm">Não há leads nesta etapa do funil para o período selecionado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedLead?.id === lead.id ? 'bg-nexus-blue border-nexus-cyan' : 'bg-nexus-primary border-transparent hover:border-nexus-blue'}`}
                    >
                      <div className="font-bold text-white">{lead.nome_completo || 'Lead sem nome'}</div>
                      <div className="text-sm text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.telefone || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          {/* Coluna do Chat */}
          <div className="bg-nexus-darker rounded-lg flex flex-col min-h-0">
            {selectedLead ? (
              <ConversationViewer lead={selectedLead} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Selecione um lead para ver a conversa.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}