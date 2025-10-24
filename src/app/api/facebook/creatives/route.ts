import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get('adId')
    
    const db = await getDb()
    const settings = db.data.settings?.facebook

    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado.' }, { status: 400 })
    }

    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = settings.accessToken
    const baseUrl = 'https://graph.facebook.com/v18.0'

    // Se adId específico, buscar detalhes completos
    if (adId) {
      const fields = [
        'id',
        'name',
        'adset_id',
        'campaign_id',
        'status',
        'effective_status',
        'creative{id,name,title,body,image_url,video_id,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action_type}',
        'tracking_specs',
        'conversion_specs'
      ].join(',')
      
      const url = `${baseUrl}/${adId}?fields=${fields}&access_token=${accessToken}`
      const resp = await fetch(url)
      const data = await resp.json()

      if (!resp.ok || data.error) {
        return NextResponse.json({ success: false, error: data?.error?.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Buscar todos os anúncios com criativos
    const fields = [
      'id',
      'name',
      'adset_id',
      'campaign_id',
      'status',
      'effective_status',
      'creative{id,name,title,body,image_url,video_id,thumbnail_url,call_to_action_type}'
    ].join(',')
    
    const url = `${baseUrl}/act_${accountId}/ads?fields=${fields}&limit=100&access_token=${accessToken}`
    const resp = await fetch(url)
    const data = await resp.json()

    if (!resp.ok || data.error) {
      return NextResponse.json({ success: false, error: data?.error?.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data.data || [] })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}