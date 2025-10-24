import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook API][campaigns] Buscando campanhas')
    
    const db = await getDb()
    const settings = db.data.settings?.facebook

    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado. Salve o Access Token em Configurações.' }, { status: 400 })
    }

    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466'
    const accessToken = settings.accessToken
    const baseUrl = 'https://graph.facebook.com/v18.0'

    const fields = [
      'id',
      'name',
      'status',
      'objective',
      'effective_status',
      'created_time',
      'updated_time'
    ].join(',')

    const url = `${baseUrl}/act_${accountId}/campaigns?fields=${fields}&limit=100&access_token=${encodeURIComponent(accessToken)}`
    
    const resp = await fetch(url)
    const data = await resp.json()

    if (!resp.ok || data.error) {
      const message = data?.error?.message || `HTTP ${resp.status} ${resp.statusText}`
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data.data || [] })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}