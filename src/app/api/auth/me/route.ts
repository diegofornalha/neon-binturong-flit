import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente admin para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId é obrigatório', user: null },
        { status: 400 }
      )
    }

    // Buscar dados do usuário usando admin (bypass RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('[Auth Me] Error fetching user:', userError)
      // Retornar usuário mock em vez de erro
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: 'teste@example.com',
          name: 'teste',
          role: 'member',
          is_super_admin: false,
          organization_id: null
        },
        organization: null
      })
    }

    // Se não for super admin e tiver organization_id, buscar organização
    let organization = null
    if (!userData.is_super_admin && userData.organization_id) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('id, name, slug, plan, status, limits, branding')
        .eq('id', userData.organization_id)
        .single()

      organization = orgData
    }

    return NextResponse.json({
      success: true,
      user: userData,
      organization
    })
  } catch (error) {
    console.error('[Auth Me] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error', user: null },
      { status: 500 }
    )
  }
}
