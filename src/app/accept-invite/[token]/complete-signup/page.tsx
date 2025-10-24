"use client"

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function CompleteSignupPage() {
  const router = useRouter()
  const params = useParams<{ token?: string }>()
  const token = params?.token ?? ""

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    try {
      setLoading(true)

      // Validar token e obter dados do convite
      const validateResponse = await fetch(`/api/invitations/validate?token=${token}`)
      const validateResult = await validateResponse.json()

      if (!validateResult.success) {
        setError(validateResult.error || 'Convite inválido')
        return
      }

      const invitation = validateResult.data
      const email = invitation.email

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          },
          emailRedirectTo: undefined // Não enviar email de confirmação
        }
      })

      if (authError) {
        throw new Error(`Erro ao criar conta: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      // 2. Aceitar convite via API (também confirma email)
      const acceptResponse = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: authData.user.id,
          name: formData.name
        })
      })

      const acceptResult = await acceptResponse.json()

      if (!acceptResult.success) {
        throw new Error(acceptResult.error || 'Erro ao aceitar convite')
      }

      // 3. Fazer login imediatamente (forçar autenticação)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      })

      if (signInError) {
        console.error('[CompleteSignup] Login error:', signInError)
        // Mesmo se login falhar, redirecionar para página de login
        toast.success('Conta criada! Faça login para continuar.')
        router.push(`/login?email=${encodeURIComponent(email)}`)
        return
      }

      toast.success('Conta criada e convite aceito com sucesso!')

      // Aguardar auth provider sincronizar
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('[CompleteSignup] Error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <CardTitle>Complete seu Cadastro</CardTitle>
          </div>
          <CardDescription>
            Defina sua senha para aceitar o convite e acessar a plataforma
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Digite a senha novamente"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta e Aceitar Convite'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao criar sua conta, você aceita o convite e terá acesso aos recursos da organização
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
