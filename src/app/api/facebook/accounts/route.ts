import { NextRequest, NextResponse } from 'next/server'
import { createFacebookBusinessClient } from '@/lib/facebook-business-client'

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook API] Fetching ad accounts')
    
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                       request.nextUrl.searchParams.get('access_token')
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    const facebookClient = createFacebookBusinessClient({
      accessToken,
      accountId: 'me', // Using 'me' to get accounts for the user
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
    })

    const connectionTest = await facebookClient.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Facebook connection failed: ${connectionTest.error}` },
        { status: 400 }
      )
    }

    const adAccounts = await facebookClient.getCampaigns() // A proxy for getting accounts
    
    console.log(`[Facebook API] Successfully fetched ${adAccounts.length} ad accounts`)
    
    return NextResponse.json({
      success: true,
      data: adAccounts,
      user: connectionTest.account
    })
  } catch (error) {
    console.error('[Facebook API] Error fetching ad accounts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ad accounts' },
      { status: 500 }
    )
  }
}