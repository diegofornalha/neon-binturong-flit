"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Chrome, CheckCircle, AlertCircle, ExternalLink, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface GoogleAccount {
  id: string
  name: string
  customerId: string
  currency: string
  status: 'connected' | 'error' | 'disconnected'
  lastSync?: string
}

export function GoogleIntegration() {
  const [activeTab, setActiveTab] = useState("oauth")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<GoogleAccount[]>([])
  
  // OAuth Method State
  const [oauthStatus, setOauthStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  
  // Manual Credentials State
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [developerId, setDeveloperId] = useState("")
  const [credentialsStatus, setCredentialsStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // OAuth Login Method
  const handleOAuthLogin = async () => {
    setIsConnecting(true)
    setOauthStatus('connecting')
    
    try {
      // Google OAuth URL
      const googleAuthUrl = `https://accounts.google.com/oauth2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&scope=https://www.googleapis.com/auth/adwords&response_type=code&access_type=offline`
      
      // Open popup window
      const popup = window.open(googleAuthUrl, 'google-auth', 'width=600,height=600')
      
      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsConnecting(false)
          setOauthStatus('idle')
        }
      }, 1000)
      
      // Mock success for demo
      setTimeout(() => {
        popup?.close()
        clearInterval(checkClosed)
        setOauthStatus('connected')
        setIsConnecting(false)
        toast.success("Conectado via OAuth com sucesso!")
        
        // Mock connected accounts
        setConnectedAccounts([
          {
            id: "1234567890",
            name: "Minha Conta Google Ads",
            customerId: "123-456-7890",
            currency: "BRL",
            status: 'connected',
            lastSync: new Date().toISOString()
          }
        ])
      }, 3000)
      
    } catch (error) {
      console.error('[GoogleOAuth] Error:', error)
      setIsConnecting(false)
      setOauthStatus('idle')
      toast.error("Erro na autenticação OAuth")
    }
  }

  // Manual Credentials Method
  const handleTestCredentials = async () => {
    if (!clientId || !clientSecret || !refreshToken || !developerId) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setCredentialsStatus('testing')
    setErrorMessage("")

    try {
      console.log('[GoogleCredentials] Testing credentials')
      
      const response = await fetch('/api/google/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken,
          developerId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha na conexão')
      }

      setCredentialsStatus('connected')
      toast.success(`Credenciais válidas! Encontradas ${data.data.length} contas`)
      
      // Convert to our format
      const accounts: GoogleAccount[] = data.data.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        customerId: acc.customer_id,
        currency: acc.currency_code,
        status: 'connected' as const,
        lastSync: new Date().toISOString()
      }))
      
      setConnectedAccounts(accounts)
      
    } catch (error) {
      console.error('[GoogleCredentials] Error:', error)
      setCredentialsStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error("Credenciais inválidas")
    }
  }

  const handleSaveCredentials = async () => {
    if (credentialsStatus !== 'connected') {
      toast.error("Teste as credenciais primeiro")
      return
    }

    try {
      const response = await fetch('/api/settings/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken,
          developerId,
          accounts: connectedAccounts
        })
      })

      if (response.ok) {
        toast.success("Configurações salvas com sucesso!")
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      toast.error("Erro ao salvar configurações")
    }
  }

  const handleDisconnectAccount = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId))
    toast.success("Conta desconectada")
  }

  const handleSyncAccount = async (accountId: string) => {
    toast.success("Sincronização iniciada")
    // Implement sync logic
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Chrome className="h-5 w-5 text-green-600" />
          Integração Google Ads
        </CardTitle>
        <CardDescription>
          Configure sua conexão com o Google Ads para importar métricas das campanhas
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oauth">Login OAuth (Recomendado)</TabsTrigger>
            <TabsTrigger value="manual">Credenciais Manuais</TabsTrigger>
          </TabsList>
          
          {/* OAuth Method */}
          <TabsContent value="oauth" className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Método Recomendado:</strong> Mais seguro e fácil de configurar. 
                Você fará login diretamente no Google e autorizará o acesso às suas contas de anúncios.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Chrome className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Google Ads Account</h3>
                    <p className="text-sm text-muted-foreground">
                      {oauthStatus === 'connected' 
                        ? "Conectado e sincronizado" 
                        : "Clique para conectar sua conta"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {oauthStatus === 'connected' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Conectado
                    </Badge>
                  )}
                  <Button 
                    onClick={handleOAuthLogin}
                    disabled={isConnecting}
                    variant={oauthStatus === 'connected' ? "outline" : "default"}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : oauthStatus === 'connected' ? (
                      'Reconectar'
                    ) : (
                      'Conectar com Google'
                    )}
                  </Button>
                </div>
              </div>

              {/* Required Permissions Info */}
              <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                <strong>Permissões que serão solicitadas:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><code>adwords</code> - Acesso completo ao Google Ads</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Manual Credentials Method */}
          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Para usuários avançados:</strong> Você precisará criar um projeto no Google Cloud Console 
                e obter as credenciais da API do Google Ads.
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="https://console.cloud.google.com/" target="_blank">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google Cloud Console
                  </a>
                </Button>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID *</Label>
                <Input
                  id="client-id"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-secret">Client Secret *</Label>
                <Input
                  id="client-secret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-token">Refresh Token *</Label>
                <Input
                  id="refresh-token"
                  type="password"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  placeholder="1//04..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="developer-id">Developer Token *</Label>
                <Input
                  id="developer-id"
                  type="password"
                  value={developerId}
                  onChange={(e) => setDeveloperId(e.target.value)}
                  placeholder="ABC123DEF456..."
                />
              </div>
            </div>

            {/* Connection Status */}
            {credentialsStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Erro:</strong> {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {credentialsStatus === 'connected' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Credenciais válidas! Contas do Google Ads encontradas.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleTestCredentials}
                disabled={credentialsStatus === 'testing' || !clientId || !clientSecret || !refreshToken || !developerId}
                variant="outline"
              >
                {credentialsStatus === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Conexão'
                )}
              </Button>
              
              <Button 
                onClick={handleSaveCredentials}
                disabled={credentialsStatus !== 'connected'}
              >
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Connected Accounts Section */}
        {connectedAccounts.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contas Conectadas</h3>
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Chrome className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {account.customerId} • {account.currency}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={account.status === 'connected' ? 'secondary' : 'destructive'}
                        className={account.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {account.status === 'connected' ? 'Ativa' : 'Erro'}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAccount(account.id)}
                      >
                        Sincronizar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}