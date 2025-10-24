"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import ParticlesBackground from '@/components/ui/particles-background'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-nexus-darker">
      <ParticlesBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-cyan-500/20 bg-nexus-primary/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
              Nexus Unlimited
            </h1>
            <p className="mt-2 text-gray-400">Acesse sua plataforma de inteligência.</p>
          </div>

          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0ea5e9',
                    brandAccent: '#00d4ff',
                    defaultButtonBackground: '#16213e',
                    defaultButtonBackgroundHover: '#1a1a2e',
                    inputBackground: '#16213e',
                    inputBorder: 'rgba(0, 212, 255, 0.3)',
                    inputBorderHover: 'rgba(0, 212, 255, 0.5)',
                    inputBorderFocus: '#00d4ff',
                    inputText: 'white',
                    anchorTextColor: '#9ca3af',
                    anchorTextHoverColor: '#00d4ff',
                  },
                  radii: {
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  }
                },
              },
              className: {
                button: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transition-all',
                input: 'focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all',
              }
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu e-mail',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                },
                forgotten_password: {
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
            showLinks={true}
            theme="dark"
          />
        </div>
      </div>
    </div>
  )
}