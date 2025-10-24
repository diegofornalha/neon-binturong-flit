interface FacebookConfig {
  accessToken: string;
  accountId: string;
  appId?: string;
  appSecret?: string;
}

interface FacebookBusinessClientOptions {
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  datePreset?: string;
  timeRange?: { since: string; until: string };
  campaignIds?: string[];
}

export class FacebookBusinessClient {
  private config: FacebookConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: FacebookConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; account?: any; error?: string }> {
    try {
      console.log('[FacebookBusiness] Testing connection');
      const url = `${this.baseUrl}/act_${this.config.accountId}?fields=id,name,account_id,currency,account_status&access_token=${this.config.accessToken}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const accountData = await response.json();
      if (accountData.error) throw new Error(accountData.error.message);
      console.log('[FacebookBusiness] Connection successful');
      return { success: true, account: accountData };
    } catch (error) {
      console.error('[FacebookBusiness] Connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCampaigns(): Promise<any[]> {
    console.log('[FacebookBusiness] Fetching campaigns');
    const url = `${this.baseUrl}/act_${this.config.accountId}/campaigns?fields=id,name,status,objective,created_time,updated_time&access_token=${this.config.accessToken}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log(`[FacebookBusiness] Found ${data.data?.length || 0} campaigns`);
    return data.data || [];
  }

  async getAdSets(campaignIds?: string[]): Promise<any[]> {
    console.log('[FacebookBusiness] Fetching ad sets');
    let url = `${this.baseUrl}/act_${this.config.accountId}/adsets?fields=id,name,campaign_id,status,created_time&access_token=${this.config.accessToken}`;
    if (campaignIds && campaignIds.length > 0) {
      const filtering = JSON.stringify([{ field: 'campaign.id', operator: 'IN', value: campaignIds }]);
      url += `&filtering=${encodeURIComponent(filtering)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log(`[FacebookBusiness] Found ${data.data?.length || 0} ad sets`);
    return data.data || [];
  }

  async getAds(adSetIds?: string[]): Promise<any[]> {
    console.log('[FacebookBusiness] Fetching ads');
    const fields = 'id,name,adset_id,campaign_id,status,effective_status,created_time,updated_time,creative';
    let url = `${this.baseUrl}/act_${this.config.accountId}/ads?fields=${fields}&limit=200&access_token=${this.config.accessToken}`;
    if (adSetIds && adSetIds.length > 0) {
      const filtering = JSON.stringify([{ field: 'adset.id', operator: 'IN', value: adSetIds }]);
      url += `&filtering=${encodeURIComponent(filtering)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log(`[FacebookBusiness] Found ${data.data?.length || 0} ads`);
    return data.data || [];
  }

  async getInsights(options: FacebookBusinessClientOptions): Promise<any[]> {
    console.log('[FacebookBusiness] Fetching insights');
    const { level = 'campaign', datePreset = 'last_30d', timeRange, campaignIds } = options;

    const fields = [
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'cpm',
      'spend',
      'reach',
      'frequency',
      'actions',
      'action_values',
      'conversions',
      'cost_per_conversion',
      'date_start',
      'date_stop',
    ].join(',');

    let url = `${this.baseUrl}/act_${this.config.accountId}/insights?fields=${fields}&level=${level}&access_token=${this.config.accessToken}`;

    if (timeRange) {
      url += `&time_range=${encodeURIComponent(JSON.stringify(timeRange))}`;
    } else {
      url += `&date_preset=${datePreset}`;
    }

    if (campaignIds && campaignIds.length > 0) {
      const filtering = JSON.stringify([{ field: 'campaign.id', operator: 'IN', value: campaignIds }]);
      url += `&filtering=${encodeURIComponent(filtering)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Facebook API Error:", errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log(`[FacebookBusiness] Found insights for ${data.data?.length || 0} items`);
    return data.data || [];
  }

  async getMetricsSummary(datePreset: string = 'last_30d'): Promise<{
    campaigns: any[];
    metrics: any[];
    summary: {
      total_campaigns: number;
      total_spend: number;
      total_impressions: number;
      total_clicks: number;
      total_conversions: number;
      total_purchase_value: number;
      average_ctr: number;
      average_cpc: number;
      average_roas: number;
    };
  }> {
    console.log('[FacebookBusiness] Getting metrics summary');
    const campaigns = await this.getCampaigns();
    const insights = await this.getInsights({ level: 'campaign', datePreset });

    const processedMetrics = insights.map((insight: any) => {
      const impressions = parseInt(insight.impressions || '0');
      const clicks = parseInt(insight.clicks || '0');
      const spend = parseFloat(insight.spend || '0');
      const conversions = parseInt(insight.conversions || '0');
      let leadConversions = 0;
      let purchaseConversions = 0;
      let purchaseValue = 0;

      if (insight.actions) {
        insight.actions.forEach((action: any) => {
          if (action.action_type === 'lead') leadConversions += parseInt(action.value || '0');
          if (action.action_type === 'purchase') purchaseConversions += parseInt(action.value || '0');
        });
      }

      if (insight.action_values) {
        insight.action_values.forEach((actionValue: any) => {
          if (actionValue.action_type === 'purchase') purchaseValue += parseFloat(actionValue.value || '0');
        });
      }

      const roas = spend > 0 ? purchaseValue / spend : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

      return {
        campaign_id: insight.campaign_id,
        campaign_name: insight.campaign_name,
        adset_id: insight.adset_id || null,
        adset_name: insight.adset_name || null,
        date_start: insight.date_start,
        date_stop: insight.date_stop,
        impressions,
        clicks,
        ctr: parseFloat(insight.ctr || '0'),
        cpc: parseFloat(insight.cpc || '0'),
        cpm: parseFloat(insight.cpm || '0'),
        spend,
        reach: parseInt(insight.reach || '0'),
        frequency: parseFloat(insight.frequency || '0'),
        conversions,
        lead_conversions: leadConversions,
        purchase_conversions: purchaseConversions,
        purchase_value: purchaseValue,
        cost_per_conversion: parseFloat(insight.cost_per_conversion || '0'),
        conversion_rate: conversionRate,
        roas,
      };
    });

    const summary = {
      total_campaigns: campaigns.length,
      total_spend: processedMetrics.reduce((sum: number, m: any) => sum + m.spend, 0),
      total_impressions: processedMetrics.reduce((sum: number, m: any) => sum + m.impressions, 0),
      total_clicks: processedMetrics.reduce((sum: number, m: any) => sum + m.clicks, 0),
      total_conversions: processedMetrics.reduce((sum: number, m: any) => sum + m.conversions, 0),
      total_purchase_value: processedMetrics.reduce((sum: number, m: any) => sum + m.purchase_value, 0),
      average_ctr: processedMetrics.length > 0 ? processedMetrics.reduce((s: number, m: any) => s + m.ctr, 0) / processedMetrics.length : 0,
      average_cpc: processedMetrics.length > 0 ? processedMetrics.reduce((s: number, m: any) => s + m.cpc, 0) / processedMetrics.length : 0,
      average_roas: processedMetrics.length > 0 ? processedMetrics.reduce((s: number, m: any) => s + m.roas, 0) / processedMetrics.length : 0,
    };

    return { campaigns, metrics: processedMetrics, summary };
  }
}

export function createFacebookBusinessClient(config: FacebookConfig): FacebookBusinessClient {
  return new FacebookBusinessClient(config);
}