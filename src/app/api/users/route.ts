import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Verificar se usuário tem permissão de admin
async function isAdmin(userId: string, organizationId: string): Promise<boolean> {
  if (!userId) return false

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, is_super_admin, organization_id')
    .eq('id', userId)
    .single()

  if (error || !data) return false

  // Super admin tem permissão em qualquer organização
  if (data.is_super_admin === true) return true

  // Usuário normal precisa ser owner/admin da organização específica
  if (data.organization_id !== organizationId) return false

  return data.role === 'owner' || data.role === 'admin'
}

// GET - Listar usuários da organização
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, is_active, last_login_at, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[Users API][GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar role de um usuário
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, role, adminId, orgId } = body
    
    if (!userId || !role || !adminId || !orgId) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Verificar permissão
    const hasPermission = await isAdmin(adminId, orgId)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Você não tem permissão para alterar roles.' }, { status: 403 })
    }

    // Não permitir que usuário mude seu próprio role
    if (userId === adminId) {
      return NextResponse.json({ error: 'Você não pode alterar sua própria permissão.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('organization_id', orgId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[Users API][PATCH] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Remover usuário da organização
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminId = searchParams.get('adminId')
    const orgId = searchParams.get('orgId')
    
    if (!userId || !adminId || !orgId) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios faltando' }, { status: 400 })
    }

    // Verificar permissão
    const hasPermission = await isAdmin(adminId, orgId)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Você não tem permissão para remover usuários.' }, { status: 403 })
    }

    // Não permitir que usuário remova a si mesmo
    if (userId === adminId) {
      return NextResponse.json({ error: 'Você não pode remover a si mesmo.' }, { status: 400 })
    }

    // Verificar se não é o último owner
    const { data: owners } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('organization_id', orgId)
      .eq('role', 'owner')

    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetUser?.role === 'owner' && owners && owners.length <= 1) {
      return NextResponse.json({ error: 'Não é possível remover o último proprietário.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('organization_id', orgId)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Usuário removido da organização'
    })
  } catch (error) {
    console.error('[Users API][DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}