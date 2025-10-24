import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// GET - Validar token de convite (rota pública)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar convite usando service role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('*, organizations(id, name, slug)')
      .eq('token', token)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se expirou
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Convite expirado' },
        { status: 400 }
      )
    }

    // Verificar se já foi aceito
    if (data.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Convite já foi aceito' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[Invitations Validate API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
