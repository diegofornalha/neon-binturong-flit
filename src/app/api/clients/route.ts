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

    // Super admin usa service role para ver tudo
    const client = superAdmin ? supabaseAdmin : supabaseAdmin
    
    let query = client
      .from('clients')
      .select('*, ad_accounts(platform, account_name)')
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
    console.error('[Clients API][GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, status, settings, organization_id } = body

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: 'organization_id é obrigatório' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        organization_id,
        name,
        email,
        phone,
        company,
        status: status || 'active',
        settings: settings || {}
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[Clients API][POST] Error:', error)
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
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
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
    console.error('[Clients API][PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('[Clients API][DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}