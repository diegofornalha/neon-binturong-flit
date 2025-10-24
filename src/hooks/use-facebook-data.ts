"use client"

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  fetchAllFacebookEntities,
  type FacebookCampaign,
  type FacebookMetric,
  type FacebookAdSet,
  type FacebookAd
} from '@/services/facebook';

type Preset = "last_7d" | "last_30d" | "last_90d";

export interface BreakdownData {
  byPlatform: { publisher_platform: string; spend: string }[];
  byDevice: { device_platform: string; spend: string }[];
}

export function useFacebookData(preset: Preset, selectedCampaignIds: string[], selectedAdSetIds: string[]) {
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [metrics, setMetrics] = useState<FacebookMetric[]>([]);
  const [adSets, setAdSets] = useState<FacebookAdSet[]>([]);
  const [ads, setAds] = useState<FacebookAd[]>([]);
  const [breakdownData, setBreakdownData] = useState<BreakdownData>({ byPlatform: [], byDevice: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState(true);

  const loadAll = useCallback(async (datePreset: Preset) => {
    console.log("[useFacebookData] Iniciando carregamento...", { preset, selectedCampaignIds, selectedAdSetIds });
    setLoading(true);
    setError(null);
    
    try {
      // Fetch entities
      const entitiesResp = await fetchAllFacebookEntities();
      console.log("[useFacebookData] Entities carregadas:", { campaigns: entitiesResp.campaigns?.length || 0 });
      setCampaigns(entitiesResp.campaigns || []);
      setAdSets(entitiesResp.adSets || []);
      setAds(entitiesResp.ads || []);

      // Build URLs with filters
      let metricsUrl = `/api/facebook/metrics?date_preset=${datePreset}&time_increment=1`;
      let breakdownsUrl = `/api/facebook/breakdowns?date_preset=${datePreset}`;
      
      const campaignFilter = selectedCampaignIds.length > 0 ? `&campaignIds=${selectedCampaignIds.join(',')}` : "";
      const adsetFilter = selectedAdSetIds.length > 0 ? `&adsetIds=${selectedAdSetIds.join(',')}` : "";
      
      metricsUrl += campaignFilter + adsetFilter;
      breakdownsUrl += campaignFilter + adsetFilter;

      console.log("[useFacebookData] URLs construídas:", { metricsUrl, breakdownsUrl });

      // Fetch metrics and breakdowns in parallel
      const [metricsResp, breakdownsResp] = await Promise.all([
        fetch(metricsUrl),
        fetch(breakdownsUrl)
      ]);

      // Process metrics
      const metricsJson = await metricsResp.json();
      console.log("[useFacebookData] Metrics response:", { status: metricsResp.status, dataLength: metricsJson.data?.length || 0 });
      
      if (!metricsResp.ok || !metricsJson.success) {
        const msg = metricsJson?.error || `Falha ao buscar métricas (${metricsResp.status})`;
        if (String(msg).toLowerCase().includes("não configurado")) {
          setIsConfigured(false);
          setError("Facebook não configurado. Vá em Configurações → Facebook Ads para salvar o Access Token.");
        } else {
          setError(msg);
        }
        setMetrics([]);
      } else {
        setMetrics(metricsJson.data || []);
        setIsConfigured(true);
      }

      // Process breakdowns
      const breakdownsJson = await breakdownsResp.json();
      console.log("[useFacebookData] Breakdowns response:", { status: breakdownsResp.status, dataLength: breakdownsJson.data?.length || 0 });
      
      if (breakdownsResp.ok && breakdownsJson.success) {
        setBreakdownData(breakdownsJson.data || { byPlatform: [], byDevice: [] });
      } else {
        console.warn("[useFacebookData] Breakdowns falhou:", breakdownsJson?.error);
        setBreakdownData({ byPlatform: [], byDevice: [] });
      }

      setLastUpdated(new Date().toLocaleString("pt-BR"));
      if (metricsJson.success) {
        toast.success("Métricas do Facebook atualizadas");
      }
    } catch (e) {
      console.error("[useFacebookData] Erro ao carregar dados:", e);
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      toast.error("Erro ao carregar métricas do Facebook");
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignIds, selectedAdSetIds]);

  useEffect(() => {
    loadAll(preset);
  }, [preset, loadAll]);

  const refetch = useCallback(() => {
    loadAll(preset);
  }, [preset, loadAll]);

  return {
    campaigns,
    adSets,
    ads,
    metrics,
    breakdownData,
    loading,
    error,
    lastUpdated,
    isConfigured,
    refetch,
    preset
  };
}