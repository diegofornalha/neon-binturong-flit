"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Option {
  id: string
  label: string
  sublabel?: string
}

interface MetricsFiltersProps {
  campaigns: { id: string; name: string }[]
  adSets: { id: string; name: string; campaign_id: string }[]
  selectedCampaignIds: string[]
  setSelectedCampaignIds: (next: string[]) => void
  selectedAdSetIds: string[]
  setSelectedAdSetIds: (next: string[]) => void
  onClear: () => void
}

export function MetricsFilters({
  campaigns,
  adSets,
  selectedCampaignIds,
  setSelectedCampaignIds,
  selectedAdSetIds,
  setSelectedAdSetIds,
  onClear
}: MetricsFiltersProps) {

  const campaignOptions: Option[] = useMemo(() => {
    return campaigns.map(c => ({ id: c.id, label: c.name }))
  }, [campaigns])

  const adsetOptions: Option[] = useMemo(() => {
    // Se houver campanhas selecionadas, filtrar ad sets dessas campanhas
    const filtered = selectedCampaignIds.length > 0
      ? adSets.filter(a => selectedCampaignIds.includes(a.campaign_id))
      : adSets
    return filtered.map(s => ({ id: s.id, label: s.name, sublabel: s.campaign_id }))
  }, [adSets, selectedCampaignIds])

  const toggleCampaign = (id: string) => {
    if (selectedCampaignIds.includes(id)) {
      setSelectedCampaignIds(selectedCampaignIds.filter(v => v !== id))
    } else {
      setSelectedCampaignIds([...selectedCampaignIds, id])
    }
  }

  const toggleAdSet = (id: string) => {
    if (selectedAdSetIds.includes(id)) {
      setSelectedAdSetIds(selectedAdSetIds.filter(v => v !== id))
    } else {
      setSelectedAdSetIds([...selectedAdSetIds, id])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Seleção de Campanhas */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Campanhas {selectedCampaignIds.length > 0 ? `(${selectedCampaignIds.length})` : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="mb-2">
            <Label className="text-sm">Selecione campanhas</Label>
          </div>
          <ScrollArea className="h-56">
            <div className="space-y-2">
              {campaignOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma campanha encontrada</div>
              ) : campaignOptions.map(opt => (
                <label key={opt.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCampaignIds.includes(opt.id)}
                    onCheckedChange={() => toggleCampaign(opt.id)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3 flex justify-between">
            <Button size="sm" variant="outline" onClick={() => setSelectedCampaignIds([])}>Limpar</Button>
            <Button size="sm" onClick={() => {}}>Fechar</Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Seleção de Conjuntos de Anúncios */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Conjuntos de Anúncios {selectedAdSetIds.length > 0 ? `(${selectedAdSetIds.length})` : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <div className="mb-2">
            <Label className="text-sm">Selecione ad sets</Label>
          </div>
          <ScrollArea className="h-56">
            <div className="space-y-2">
              {adsetOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhum ad set encontrado</div>
              ) : adsetOptions.map(opt => (
                <label key={opt.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAdSetIds.includes(opt.id)}
                    onCheckedChange={() => toggleAdSet(opt.id)}
                  />
                  <div>
                    <div className="text-sm">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-muted-foreground">Campanha: {opt.sublabel}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3 flex justify-between">
            <Button size="sm" variant="outline" onClick={() => setSelectedAdSetIds([])}>Limpar</Button>
            <Button size="sm" onClick={() => {}}>Fechar</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={onClear}>Limpar filtros</Button>
    </div>
  )
}