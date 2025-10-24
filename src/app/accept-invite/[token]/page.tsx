"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface InvitationData {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  organizations: {
    name: string
    slug: string
  }
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useParams<{ token?: string }>()
  const token = params?.token ?? ""

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Convite inválido ou não encontrado')
      setLoading(false)
      return
    }
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)

      // Usar API pública para validar token (bypass RLS)
      const response = await fetch(`/api/invitations/validate?token=${token}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Convite inválido ou não encontrado')
        return
      }

      setInvitation(result.data as InvitationData)
    } catch (error) {
      console.error('[AcceptInvite] Error:', error)
      setError('Erro ao carregar convite')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invitation) return

    try {
      setAccepting(true)

      // Verificar se usuário está logado
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirecionar para página de completar cadastro
        router.push(`/accept-invite/${token}/complete-signup`)
        return
      }

      // Aceitar convite via API (bypass RLS)
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.id
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao aceitar convite')
      }

      toast.success('Convite aceito com sucesso!')

      // Aguardar um pouco para o auth provider atualizar
      await new Promise(resolve => setTimeout(resolve, 500))

      router.push('/dashboard')
    } catch (error) {
      console.error('[AcceptInvite] Error accepting:', error)
      toast.error('Erro ao aceitar convite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Convite Inválido</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <CardTitle>Convite para Equipe</CardTitle>
          </div>
          <CardDescription>
            Você foi convidado para se juntar a uma organização
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{invitation?.organizations.name}</strong> convidou você para se juntar como{' '}
              <strong className="capitalize">{invitation?.role}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{invitation?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Função:</span>
              <span className="font-medium capitalize">{invitation?.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expira em:</span>
              <span className="font-medium">
                {invitation && new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={accepting}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aceitando...
              </>
            ) : (
              'Aceitar Convite'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao aceitar, você terá acesso aos dados e recursos da organização
          </p>
        </CardContent>
      </Card>
    </div>
  )
}