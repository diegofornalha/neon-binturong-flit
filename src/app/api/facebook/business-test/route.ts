import { NextRequest, NextResponse } from 'next/server'
import { createFacebookBusinessClient } from '@/lib/facebook-business-client'
import { getDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook Business Test] Testing connection with direct API calls')

    const db = await getDb()
    const facebookSettings = db.data.settings?.facebook

    const accessToken =
      facebookSettings?.accessToken ||
      'EAAVU1HuoPNUBPN3AXZAV8ZCMXvAK7dqVQy4YjL3fg71nqitGMN8PFdnQ7VCVGXZBgcc6aaWji8q0wt7jrZA26siD1rspvznwTHunf1ttDyBEyhYSNDk16ODb3wGNTwjRK9uDmjOi7qVgmgG3ZBwkJr3CZA3hmfCQkWZBxiKDMWBZCNppqI1GFLqfhGD1tzjSEwTVpeJ0ieDjimpPjnBOHXohfE3K'

    const accountId =
      (facebookSettings?.accounts && facebookSettings.accounts[0]?.account_id) ||
      '2086645648498466'

    const facebookClient = createFacebookBusinessClient({
      accessToken,
      accountId,
      appId: facebookSettings?.appId || '1500646467976405',
      appSecret: facebookSettings?.appSecret || 'b3cb0095c94e42c9f2f21d4c2d1a1fa2',
    })

    const connectionTest = await facebookClient.testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: connectionTest.error,
          step: 'connection_test',
        },
        { status: 400 }
      )
    }

    const campaigns = await facebookClient.getCampaigns()

    const insights = await facebookClient.getInsights({
      level: 'campaign',
      datePreset: 'last_7d',
    })

    return NextResponse.json({
      success: true,
      message: 'Facebook API connection successful using direct REST calls!',
      data: {
        account: connectionTest.account,
        campaigns: {
          count: campaigns.length,
          campaigns: campaigns.slice(0, 3),
        },
        insights: {
          count: insights.length,
          sample: insights.slice(0, 2),
        },
      },
    })
  } catch (error) {
    console.error('[Facebook Business Test] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        step: 'api_error',
      },
      { status: 500 }
    )
  }
}