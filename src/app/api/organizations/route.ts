import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/supabase-client'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    // Busca dados da organização
    const [organizationResult, clientsResult, adAccountsResult] = await Promise.all([
      supabaseAdmin.from('organizations').select('*').eq('id', orgId).single(),
      supabaseAdmin.from('clients').select('*').eq('organization_id', orgId),
      supabaseAdmin.from('ad_accounts').select('*').eq('organization_id', orgId)
    ])
    
    if (organizationResult.error) throw organizationResult.error
    
    const clients = clientsResult.data || []
    const adAccounts = adAccountsResult.data || []
    
    return NextResponse.json({
      success: true,
      data: {
        organization: organizationResult.data,
        clients,
        adAccounts,
        stats: {
          totalClients: clients.length,
          totalAdAccounts: adAccounts.length,
          activeClients: clients.filter((c: any) => c.status === 'active').length,
          connectedAccounts: adAccounts.filter((a: any) => a.status === 'connected').length
        }
      }
    })
    
  } catch (error) {
    console.error('[Organizations API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[Organizations API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}