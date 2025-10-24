import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/integrations/supabase/client'
import { DEFAULT_ORGANIZATION_ID } from '@/lib/organization'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId') || DEFAULT_ORGANIZATION_ID

    const { data, error } = await supabase
      .from('reports')
      .select('*, clients(id, name, email)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('[Reports API][GET] Error:', error)
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
      organization_id,
      client_id,
      name,
      format,
      frequency,
      recipients,
      next_send,
      last_sent,
    } = body

    if (!organization_id || !name || !format || !frequency || !next_send || !recipients?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        organization_id,
        client_id: client_id || null,
        name,
        format,
        frequency,
        recipients,
        next_send,
        last_sent: last_sent || null,
      })
      .select('*, clients(id, name, email)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[Reports API][POST] Error:', error)
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
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, clients(id, name, email)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[Reports API][PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Report deleted successfully' })
  } catch (error) {
    console.error('[Reports API][DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}