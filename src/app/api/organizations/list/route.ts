import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente admin para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Cliente regular para auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Pegar usuário autenticado
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Obter usuário do token OU da sessão
    const { data: { user }, error: authError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é super admin usando supabaseAdmin (bypass RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('[Organizations List] Error checking user:', userError)
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar permissões' },
        { status: 500 }
      )
    }

    if (!userData.is_super_admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas super admins podem listar todas as organizações.' },
        { status: 403 }
      )
    }

    // Buscar todas as organizações
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug, plan, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[Organizations List API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
