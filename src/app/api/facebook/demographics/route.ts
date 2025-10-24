import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

const BASE_URL = 'https://graph.facebook.com/v18.0'

async function fetchBreakdown(params: {
  accountId: string
  accessToken: string
  datePreset: string
  breakdown: 'gender' | 'age' | 'country' | 'region' | 'dma'
  campaignIds?: string[]
  adsetIds?: string[]
}) {
  const { accountId, accessToken, datePreset, breakdown, campaignIds, adsetIds } = params
  const fields = 'clicks,impressions,spend,reach,frequency'
  let url = `${BASE_URL}/act_${accountId}/insights?fields=${encodeURIComponent(fields)}&date_preset=${encodeURIComponent(
    datePreset
  )}&breakdowns=${breakdown}&limit=500&access_token=${encodeURIComponent(accessToken)}`

  const filtering: any[] = []
  if (campaignIds && campaignIds.length > 0) filtering.push({ field: 'campaign.id', operator: 'IN', value: campaignIds })
  if (adsetIds && adsetIds.length > 0) filtering.push({ field: 'adset.id', operator: 'IN', value: adsetIds })
  if (filtering.length > 0) url += `&filtering=${encodeURIComponent(JSON.stringify(filtering))}`

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
    const campaignIds = searchParams.get('campaignIds')?.split(',').filter(Boolean)
    const adsetIds = searchParams.get('adsetIds')?.split(',').filter(Boolean)

    const db = await getDb()
    const fb = db.data.settings?.facebook
    if (!fb?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado.' }, { status: 400 })
    }
    const accountId = fb.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = fb.accessToken

    const [genderRaw, ageRaw, countryRaw, regionRaw] = await Promise.all([
      fetchBreakdown({ accountId, accessToken, datePreset, breakdown: 'gender', campaignIds, adsetIds }),
      fetchBreakdown({ accountId, accessToken, datePreset, breakdown: 'age', campaignIds, adsetIds }),
      fetchBreakdown({ accountId, accessToken, datePreset, breakdown: 'country', campaignIds, adsetIds }),
      fetchBreakdown({ accountId, accessToken, datePreset, breakdown: 'region', campaignIds, adsetIds }),
    ])

    // Agregar por dimensão
    const aggregate = (rows: any[], key: string) => {
      const map = new Map<string, { name: string; clicks: number; impressions: number; spend: number; reach: number; frequency: number }>()
      rows.forEach((r) => {
        const k = r[key] || 'unknown'
        const prev = map.get(k) || { name: k, clicks: 0, impressions: 0, spend: 0, reach: 0, frequency: 0 }
        prev.clicks += Number(r.clicks || 0)
        prev.impressions += Number(r.impressions || 0)
        prev.spend += Number(r.spend || 0)
        prev.reach += Number(r.reach || 0)
        prev.frequency += Number(r.frequency || 0)
        map.set(k, prev)
      })
      return Array.from(map.values())
    }

    const gender = aggregate(genderRaw, 'gender')
    const age = aggregate(ageRaw, 'age')
    const country = aggregate(countryRaw, 'country')
    const region = aggregate(regionRaw, 'region')

    return NextResponse.json({ success: true, data: { gender, age, country, region } })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}