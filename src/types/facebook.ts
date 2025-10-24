export interface FacebookMetric {
  campaign_id: string
  campaign_name: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  impressions: number
  clicks: number
  spend: number
  actions?: Array<{ action_type: string; value: number }>
  reach?: number
  frequency?: number
  ctr: number
  cpc: number
  cpm: number
  cpp?: number
  date_start: string
  date_stop: string
  conversions?: number
  engagement?: number
  quality_ranking?: string
}

export interface FacebookCampaign {
  campaign_id: string
  campaign_name: string
  status?: string
  objective?: string
  effective_status?: string
  created_time?: string
  updated_time?: string
}

export interface FacebookAdSet {
  id: string
  name: string
  campaign_id: string
  status?: string
  effective_status?: string
  created_time?: string
  updated_time?: string
  daily_budget?: string
  lifetime_budget?: string
  start_time?: string
  end_time?: string
}

export interface FacebookAd {
  id: string
  name: string
  adset_id: string
  campaign_id: string
  status?: string
  effective_status?: string
  created_time?: string
  updated_time?: string
  creative?: any
}