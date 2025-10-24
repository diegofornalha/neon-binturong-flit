import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar usuário para remover organization_id e garantir is_super_admin = true
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        organization_id: null,
        is_super_admin: true,
        role: 'owner', // Super admin deve ter role owner
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: 'Super admin corrigido com sucesso! organization_id removido.'
    })
  } catch (error) {
    console.error('[Debug Fix Super Admin] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
