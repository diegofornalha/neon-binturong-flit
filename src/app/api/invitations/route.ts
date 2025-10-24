import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_ORGANIZATION_ID } from '@/lib/organization';
import { sendInviteEmail } from '@/lib/email';

// Cliente com service role para bypass de RLS em operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykqypwkvgozkviswbhif.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Função para verificar se o usuário tem permissão de admin
async function isAdmin(userId: string, organizationId: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role, is_super_admin, organization_id')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  // Super admin tem permissão em qualquer organização
  if (data.is_super_admin === true) return true;

  // Usuário normal precisa ser owner/admin da organização específica
  if (data.organization_id !== organizationId) return false;

  return data.role === 'owner' || data.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || DEFAULT_ORGANIZATION_ID;
    
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('*, users(name, email)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[Invitations API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, email, role, invited_by } = body;
    
    if (!organization_id || !email || !role || !invited_by) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // **VERIFICAÇÃO DE PERMISSÃO**
    const hasPermission = await isAdmin(invited_by, organization_id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Você não tem permissão para convidar usuários.' }, { status: 403 });
    }
    
    const { data: existing } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um convite pendente para este email' },
        { status: 400 }
      );
    }
    
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single();
    
    let inviterName = undefined;
    if (invited_by) {
      const { data: inviter } = await supabaseAdmin
        .from('users')
        .select('name')
        .eq('id', invited_by)
        .single();
      
      inviterName = inviter?.name;
    }
    
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id,
        email,
        role,
        token,
        invited_by,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Invitations API] Error:', error);
      throw error;
    }
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${appUrl}/accept-invite/${token}`;
    
    try {
      await sendInviteEmail({
        to: email,
        organizationName: org?.name || 'Organização',
        inviterName,
        role,
        inviteLink
      });
    } catch (emailError) {
      console.error('[Invitations API] Email error:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      data,
      inviteLink,
      message: 'Convite criado e email enviado com sucesso'
    });
  } catch (error) {
    console.error('[Invitations API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const orgId = searchParams.get('orgId');
    
    if (!invitationId || !userId || !orgId) {
      return NextResponse.json({ error: 'ID do convite, do usuário e da organização são obrigatórios' }, { status: 400 });
    }

    // **VERIFICAÇÃO DE PERMISSÃO**
    const hasPermission = await isAdmin(userId, orgId);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Você não tem permissão para deletar convites.' }, { status: 403 });
    }
    
    const { error } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('id', invitationId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Convite removido com sucesso'
    });
  } catch (error) {
    console.error('[Invitations API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}