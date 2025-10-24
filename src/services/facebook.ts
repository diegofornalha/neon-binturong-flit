const API_BASE_URL = '/api/facebook';

export interface FacebookCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  effective_status?: string;
  created_time?: string;
  updated_time?: string;
}

export interface FacebookMetric {
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  ad_id: string;
  ad_name: string;
  impressions: number;
  clicks: number;
  spend: number;
  actions?: Array<{ action_type: string; value: number }>;
  reach: number;
  frequency: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpp?: number;
  date_start: string;
  date_stop: string;
}

export interface FacebookAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  effective_status?: string;
  created_time?: string;
  updated_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
}

export interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  campaign_id: string;
  status: string;
  effective_status?: string;
  created_time?: string;
  updated_time?: string;
  creative?: any;
}

export interface FacebookAllEntities {
  campaigns: FacebookCampaign[];
  adSets: FacebookAdSet[];
  ads: FacebookAd[];
}

export const fetchFacebookCampaigns = async (): Promise<FacebookCampaign[]> => {
  const response = await fetch(`${API_BASE_URL}/campaigns`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
};

export const fetchFacebookMetrics = async (): Promise<FacebookMetric[]> => {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
};

export const fetchFacebookAdSets = async (): Promise<FacebookAdSet[]> => {
  const response = await fetch(`${API_BASE_URL}/adsets`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
};

export const fetchFacebookAds = async (): Promise<FacebookAd[]> => {
  const response = await fetch(`${API_BASE_URL}/ads`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
};

export const fetchAllFacebookEntities = async (): Promise<FacebookAllEntities> => {
  const response = await fetch(`${API_BASE_URL}/all-entities`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || { campaigns: [], adSets: [], ads: [] };
};