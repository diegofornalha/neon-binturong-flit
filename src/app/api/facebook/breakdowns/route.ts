import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

async function fetchBreakdown(accountId: string, accessToken: string, datePreset: string, breakdown: 'publisher_platform' | 'device_platform', campaignIds?: string[], adsetIds?: string[]) {
  const baseUrl = 'https://graph.facebook.com/v18.0'
  const fields = 'spend,impressions,clicks'
  let url = `${baseUrl}/act_${accountId}/insights?fields=${fields}&date_preset=${encodeURIComponent(datePreset)}&breakdowns=${breakdown}&limit=500&access_token=${encodeURIComponent(accessToken)}`
  
  const filtering: any[] = []
  if (campaignIds && campaignIds.length > 0) {
    filtering.push({ field: 'campaign.id', operator: 'IN', value: campaignIds })
  }
  if (adsetIds && adsetIds.length > 0) {
    filtering.push({ field: 'adset.id', operator: 'IN', value: adsetIds })
  }
  if (filtering.length > 0) {
    url += `&filtering=${encodeURIComponent(JSON.stringify(filtering))}`
  }

  const resp = await fetch(url)
  const data = await resp.json()
  if (!resp.ok || data.error) {
    throw new Error(data?.error?.message || `HTTP ${resp.status} ${resp.statusText}`)
  }
  return data.data || []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get('date_preset') || 'last_30d'
    const campaignIds = searchParams.get('campaignIds')?.split(',') // Novo filtro
    const adsetIds = searchParams.get('adsetIds')?.split(',')     // Novo filtro

    const db = await getDb()
    const settings = db.data.settings?.facebook
    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado.' }, { status: 400 })
    }
    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = settings.accessToken

    const [byPlatform, byDevice] = await Promise.all([
      fetchBreakdown(accountId, accessToken, datePreset, 'publisher_platform', campaignIds, adsetIds),
      fetchBreakdown(accountId, accessToken, datePreset, 'device_platform', campaignIds, adsetIds)
    ])

    return NextResponse.json({ success: true, data: { byPlatform, byDevice } })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}