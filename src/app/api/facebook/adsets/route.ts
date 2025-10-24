import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const settings = db.data.settings?.facebook

    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado.' }, { status: 400 })
    }

    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = settings.accessToken
    const baseUrl = 'https://graph.facebook.com/v18.0'

    const fields = 'id,name,campaign_id,status,effective_status,created_time,updated_time,daily_budget,lifetime_budget,start_time,end_time'
    const url = `${baseUrl}/act_${accountId}/adsets?fields=${fields}&limit=200&access_token=${accessToken}`
    
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