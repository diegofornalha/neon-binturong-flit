import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

const BASE_URL = 'https://graph.facebook.com/v18.0'

// Cache simples para evitar chamadas repetidas de geocodificação
const geoCache = new Map<string, { lat: number; lng: number }>()

async function getCoordinates(city: string, apiKey: string) {
  if (geoCache.has(city)) {
    return geoCache.get(city)
  }
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()

  if (data.status === 'OK' && data.results[0]) {
    const location = data.results[0].geometry.location
    geoCache.set(city, location)
    return location
  }
  
  console.warn(`[Geocoding] Não foi possível encontrar coordenadas para: ${city}`)
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get('date_preset') || 'last_30d'
    const campaignIds = searchParams.get('campaignIds')?.split(',').filter(Boolean)
    const adsetIds = searchParams.get('adsetIds')?.split(',').filter(Boolean)

    const db = await getDb()
    const fb = db.data.settings?.facebook
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!fb?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado.' }, { status: 400 })
    }
    if (!googleApiKey) {
      return NextResponse.json({ success: false, error: 'Chave de API do Google Maps não configurada.' }, { status: 400 })
    }

    const accountId = fb.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = fb.accessToken

    const fields = 'city,clicks,impressions,spend'
    let url = `${BASE_URL}/act_${accountId}/insights?fields=${fields}&date_preset=${datePreset}&breakdowns=city&limit=50&access_token=${accessToken}`

    const filtering: any[] = []
    if (campaignIds && campaignIds.length > 0) filtering.push({ field: 'campaign.id', operator: 'IN', value: campaignIds })
    if (adsetIds && adsetIds.length > 0) filtering.push({ field: 'adset.id', operator: 'IN', value: adsetIds })
    if (filtering.length > 0) url += `&filtering=${encodeURIComponent(JSON.stringify(filtering))}`

    const resp = await fetch(url)
    const json = await resp.json()
    if (!resp.ok || json.error) {
      throw new Error(json?.error?.message || `HTTP ${resp.status}`)
    }

    const rows: any[] = json.data || []
    
    const citiesWithCoords = await Promise.all(
      rows.map(async (row) => {
        const coords = await getCoordinates(row.city, googleApiKey)
        if (coords) {
          return {
            city: row.city,
            clicks: Number(row.clicks || 0),
            impressions: Number(row.impressions || 0),
            spend: Number(row.spend || 0),
            lat: coords.lat,
            lng: coords.lng,
          }
        }
        return null
      })
    )

    const validCities = citiesWithCoords.filter(Boolean).sort((a, b) => b!.clicks - a!.clicks)

    return NextResponse.json({ success: true, data: validCities })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' }, { status: 500 })
  }
}