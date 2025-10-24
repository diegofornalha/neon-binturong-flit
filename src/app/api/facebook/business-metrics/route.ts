import { NextRequest, NextResponse } from 'next/server'
import { createFacebookBusinessClient } from '@/lib/facebook-business-client'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook Business Metrics] Fetching metrics with direct API calls')

    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get('date_preset') || 'last_30d'
    const level = searchParams.get('level') || 'campaign'

    const db = await getDb()
    const facebookSettings = db.data.settings?.facebook

    if (!facebookSettings || !facebookSettings.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Facebook não configurado. Configure nas Configurações primeiro.',
        },
        { status: 400 }
      )
    }

    const accountId =
      (facebookSettings.accounts && facebookSettings.accounts[0]?.account_id) ||
      '2086645648498466'

    const facebookClient = createFacebookBusinessClient({
      accessToken: facebookSettings.accessToken,
      accountId,
      appId: facebookSettings.appId || '1500646467976405',
      appSecret: facebookSettings.appSecret || 'b3cb0095c94e42c9f2f21d4c2d1a1fa2',
    })

    const metricsData = await facebookClient.getMetricsSummary(datePreset)

    console.log(
      `[Facebook Business Metrics] Successfully processed ${metricsData.metrics.length} campaigns`
    )

    return NextResponse.json({
      success: true,
      data: metricsData.metrics,
      summary: metricsData.summary,
      campaigns: metricsData.campaigns,
      meta: {
        account_id: accountId,
        date_preset: datePreset,
        level: level,
        total_results: metricsData.metrics.length,
      },
    })
  } catch (error) {
    console.error('[Facebook Business Metrics] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}