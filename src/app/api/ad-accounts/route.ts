import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/supabase-client'

// Cliente com service role para bypass de RLS quando necessário
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgIdParam = searchParams.get('orgId')
    
    // Verificar se é super admin
    const superAdmin = await isSuperAdmin()
    
    if (!superAdmin && !orgIdParam) {
      return NextResponse.json(
        { success: false, error: 'organization_id é obrigatório' },
        { status: 400 }
      )
    }
    
    let query = supabaseAdmin
      .from('ad_accounts')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
    
    // Filtrar por organização se especificado
    if (orgIdParam) {
      query = query.eq('organization_id', orgIdParam)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[AdAccounts API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      client_id, 
      platform, 
      account_id, 
      account_name, 
      access_token,
      refresh_token,
      status,
      metadata,
      organization_id
    } = body
    
    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!platform || !account_id || !account_name) {
      return NextResponse.json(
        { error: 'Platform, account ID and account name are required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('ad_accounts')
      .insert({
        organization_id,
        client_id: client_id || null,
        platform,
        account_id,
        account_name,
        access_token,
        refresh_token,
        status: status || 'connected',
        metadata: metadata || {}
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[AdAccounts API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('ad_accounts')
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
    console.error('[AdAccounts API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('ad_accounts')
      .delete()
      .eq('id', accountId)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('[AdAccounts API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}