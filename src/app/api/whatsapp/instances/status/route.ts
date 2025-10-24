import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// GET - Verificar status da instância
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar instância
    const { data: instance, error: fetchError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (fetchError || !instance) {
      return NextResponse.json(
        { success: false, error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // Buscar status na Evolution API
    try {
      const statusResponse = await fetch(
        `${instance.evolution_url}/instance/connectionState/${instance.instance_key}`,
        {
          method: 'GET',
          headers: {
            'apikey': instance.evolution_api_key
          }
        }
      )

      if (!statusResponse.ok) {
        throw new Error('Erro ao buscar status')
      }

      const statusData = await statusResponse.json()
      const isConnected = statusData.state === 'open' || statusData.instance?.state === 'open'

      // Atualizar status no banco
      let newStatus = 'disconnected'
      if (isConnected) {
        newStatus = 'connected'
      } else if (statusData.state === 'connecting') {
        newStatus = 'connecting'
      }

      const { data: updated } = await supabaseAdmin
        .from('whatsapp_instances')
        .update({
          status: newStatus,
          last_seen: new Date().toISOString(),
          ...(isConnected && { connected_at: new Date().toISOString() })
        })
        .eq('id', instanceId)
        .select()
        .single()

      return NextResponse.json({
        success: true,
        data: updated,
        evolutionStatus: statusData
      })
    } catch (apiError) {
      console.error('[Evolution API] Status check error:', apiError)

      // Atualizar como desconectado se não conseguir verificar
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ status: 'disconnected' })
        .eq('id', instanceId)

      return NextResponse.json({
        success: true,
        data: { ...instance, status: 'disconnected' },
        warning: 'Não foi possível verificar status na Evolution API'
      })
    }
  } catch (error) {
    console.error('[WhatsApp Status API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Desconectar instância
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar instância
    const { data: instance, error: fetchError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (fetchError || !instance) {
      return NextResponse.json(
        { success: false, error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // Desconectar na Evolution API
    try {
      await fetch(`${instance.evolution_url}/instance/logout/${instance.instance_key}`, {
        method: 'DELETE',
        headers: {
          'apikey': instance.evolution_api_key
        }
      })
    } catch (apiError) {
      console.error('[Evolution API] Logout error:', apiError)
    }

    // Atualizar status no banco
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('whatsapp_instances')
      .update({
        status: 'disconnected',
        qr_code: null
      })
      .eq('id', instanceId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Instância desconectada com sucesso'
    })
  } catch (error) {
    console.error('[WhatsApp Disconnect API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
