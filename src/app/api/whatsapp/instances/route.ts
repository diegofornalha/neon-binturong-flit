import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// GET - Listar instâncias da organização
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const clientId = searchParams.get('clientId')

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'orgId é obrigatório' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    // Filtrar por cliente específico se fornecido
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[WhatsApp Instances API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova instância
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organization_id,
      client_id,
      instance_name,
      instance_key,
      evolution_url,
      evolution_api_key
    } = body

    // Validações
    if (!organization_id || !instance_name || !instance_key || !evolution_url || !evolution_api_key) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: organization_id, instance_name, instance_key, evolution_url, evolution_api_key' },
        { status: 400 }
      )
    }

    // Verificar se instance_key já existe
    const { data: existing } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id')
      .eq('instance_key', instance_key)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma instância com esta chave' },
        { status: 400 }
      )
    }

    // Criar instância
    const { data, error } = await supabaseAdmin
      .from('whatsapp_instances')
      .insert({
        organization_id,
        client_id: client_id || null,
        instance_name,
        instance_key,
        evolution_url,
        evolution_api_key,
        status: 'disconnected'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Instância criada com sucesso'
    })
  } catch (error) {
    console.error('[WhatsApp Instances API] POST Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar instância
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da instância é obrigatório' },
        { status: 400 }
      )
    }

    // Não permitir atualização de campos críticos
    const allowedFields = ['instance_name', 'status', 'phone', 'qr_code', 'webhook_enabled', 'webhook_events']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const { data, error } = await supabaseAdmin
      .from('whatsapp_instances')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Instância atualizada com sucesso'
    })
  } catch (error) {
    console.error('[WhatsApp Instances API] PATCH Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar instância
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da instância é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('whatsapp_instances')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Instância deletada com sucesso'
    })
  } catch (error) {
    console.error('[WhatsApp Instances API] DELETE Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
