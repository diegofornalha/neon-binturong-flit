import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Metrics API] Fetching metrics data')
    
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Mock metrics data - in a real app, this would come from your database
    const mockMetrics = [
      {
        id: "1",
        campaignId: "1234567890",
        campaignName: "Summer Sale",
        platform: "facebook",
        date: "2023-05-15",
        impressions: 125000,
        clicks: 3200,
        ctr: 2.56,
        cpc: 1.25,
        cpm: 3.20,
        cost: 400,
        conversions: 45,
        cpa: 11.11,
        roas: 4.2
      },
      {
        id: "2",
        campaignId: "9876543210",
        campaignName: "New Product Launch",
        platform: "google",
        date: "2023-05-15",
        impressions: 89000,
        clicks: 2100,
        ctr: 2.36,
        cpc: 1.85,
        cpm: 4.37,
        cost: 390,
        conversions: 32,
        cpa: 12.19,
        roas: 3.8
      }
    ]
    
    // Filter by platform if specified
    let filteredMetrics = mockMetrics
    if (platform && platform !== 'both') {
      filteredMetrics = mockMetrics.filter(metric => metric.platform === platform)
    }
    
    console.log(`[Metrics API] Returning ${filteredMetrics.length} metrics`)
    
    return NextResponse.json({
      success: true,
      data: filteredMetrics,
      total: filteredMetrics.length
    })
  } catch (error) {
    console.error('[Metrics API] Failed to fetch metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}