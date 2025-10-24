import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente regular para auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Cliente admin para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId, name } = body

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, error: 'Token e userId são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar convite
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .select('*, organization_id')
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se expirou
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este convite expirou' },
        { status: 400 }
      )
    }

    // Verificar se já foi aceito
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Este convite já foi aceito' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe na tabela users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (existingUser) {
      // Usuário já existe - verificar email e atualizar
      if (existingUser.email !== invitation.email) {
        return NextResponse.json(
          { success: false, error: 'Este convite foi enviado para outro email' },
          { status: 403 }
        )
      }

      // Atualizar usuário existente
      const updateData: any = {
        organization_id: invitation.organization_id,
        role: invitation.role
      }

      if (name) {
        updateData.name = name
      }

      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (updateUserError) {
        console.error('[Accept Invite] Error updating user:', updateUserError)
        throw updateUserError
      }
    } else {
      // Usuário não existe - criar registro (novo usuário que acabou de se cadastrar)
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: invitation.email,
          name: name || invitation.email.split('@')[0],
          organization_id: invitation.organization_id,
          role: invitation.role,
          is_active: true
        })

      if (createUserError) {
        console.error('[Accept Invite] Error creating user:', createUserError)
        throw createUserError
      }

      // Confirmar email automaticamente (bypass confirmação do Supabase)
      try {
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )

        if (confirmError) {
          console.error('[Accept Invite] Error confirming email:', confirmError)
          // Não falha se não conseguir confirmar, usuário pode confirmar manualmente
        }
      } catch (error) {
        console.error('[Accept Invite] Error in email confirmation:', error)
      }
    }

    // Atualizar convite para aceito
    const { error: updateInviteError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateInviteError) {
      console.error('[Accept Invite] Error updating invitation:', updateInviteError)
      throw updateInviteError
    }

    return NextResponse.json({
      success: true,
      message: 'Convite aceito com sucesso'
    })
  } catch (error) {
    console.error('[Accept Invite API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
