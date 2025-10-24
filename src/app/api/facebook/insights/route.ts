import { NextRequest, NextResponse } from 'next/server'
import { createFacebookBusinessClient } from '@/lib/facebook-business-client'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook API] Fetching campaign insights')
    
    const { searchParams } = new URL(request.url)
    const adAccountId = searchParams.get('adAccountId')
    const campaignIds = searchParams.get('campaignIds')?.split(',')
    const since = searchParams.get('since')
    const until = searchParams.get('until')
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                       searchParams.get('access_token')
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'Ad Account ID is required' },
        { status: 400 }
      )
    }

    const facebookClient = createFacebookBusinessClient({
      accessToken,
      accountId: adAccountId,
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
    })

    const dateRange = since && until ? { since, until } : undefined

    // FIX: Removed adAccountId from the options object, as it's part of the client's config, not the method's options.
    const insights = await facebookClient.getInsights({ campaignIds })
    
    const summary = await facebookClient.getMetricsSummary(adAccountId)
    
    console.log(`[Facebook API] Successfully fetched insights for ${insights.length} campaigns`)
    
    return NextResponse.json({
      success: true,
      data: insights,
      summary
    })
  } catch (error) {
    console.error('[Facebook API] Error fetching insights:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}