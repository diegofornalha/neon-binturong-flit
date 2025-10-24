"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface FacebookConnectionSetupProps {
  onConnectionSuccess: (accessToken: string) => void
}

export function FacebookConnectionSetup({ onConnectionSuccess }: FacebookConnectionSetupProps) {
  const [accessToken, setAccessToken] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast.error("Por favor, insira o Access Token")
      return
    }

    setIsConnecting(true)
    setConnectionStatus('idle')
    setErrorMessage("")

    try {
      console.log('[FacebookSetup] Testing connection')
      
      const response = await fetch('/api/facebook/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha na conexão')
      }

      console.log('[FacebookSetup] Connection successful')
      setConnectionStatus('success')
      toast.success(`Conectado com sucesso! Encontradas ${data.data.length} contas de anúncios`)
      onConnectionSuccess(accessToken)
      
    } catch (error) {
      console.error('[FacebookSetup] Connection failed:', error)
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error("Falha na conexão com Facebook")
    } finally {
      setIsConnecting(false)
    }
  }

  const generateAccessTokenUrl = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    if (!appId) return '#'
    
    const permissions = 'ads_read,ads_management,business_management'
    return `https://developers.facebook.com/tools/explorer/?method=GET&path=me%3Ffields%3Did%2Cname&version=v18.0&app_id=${appId}&permissions=${permissions}`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">f</span>
          </div>
          Conectar Facebook Ads
        </CardTitle>
        <CardDescription>
          Configure sua conexão com o Facebook Ads para importar métricas das campanhas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como obter seu Access Token:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Acesse o Graph API Explorer do Facebook</li>
              <li>Selecione seu App e as permissões necessárias</li>
              <li>Gere um Access Token de longa duração</li>
              <li>Cole o token no campo abaixo</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Access Token Input */}
        <div className="space-y-2">
          <Label htmlFor="access-token">Facebook Access Token</Label>
          <Input
            id="access-token"
            type="password"
            placeholder="EAAG..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="font-mono text-sm"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Mantenha seu token seguro e não o compartilhe
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateAccessTokenUrl(), '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Graph API Explorer
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Conexão estabelecida com sucesso! Suas contas de anúncios foram encontradas.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Erro na conexão:</strong> {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Connect Button */}
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting || !accessToken.trim()}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            'Conectar Facebook Ads'
          )}
        </Button>

        {/* Required Permissions */}
        <div className="text-xs text-muted-foreground">
          <strong>Permissões necessárias:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><code>ads_read</code> - Para ler dados de campanhas e métricas</li>
            <li><code>ads_management</code> - Para gerenciar campanhas</li>
            <li><code>business_management</code> - Para acessar Business Manager</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}