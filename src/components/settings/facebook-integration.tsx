"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Facebook, CheckCircle, AlertCircle, ExternalLink, Loader2, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

interface FacebookAccount {
  id: string
  name: string
  account_id: string
  currency: string
  status: 'connected' | 'error' | 'disconnected'
  lastSync?: string
}

export function FacebookIntegration() {
  const [activeTab, setActiveTab] = useState("manual")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<FacebookAccount[]>([])
  
  // Manual Credentials State with correct values
  const [appId, setAppId] = useState("1500646467976405")
  const [appSecret, setAppSecret] = useState("b3cb0095c94e42c9f2f21d4c2d1a1fa2")
  const [accessToken, setAccessToken] = useState("EAAVU1HuoPNUBPN3AXZAV8ZCMXvAK7dqVQy4YjL3fg71nqitGMN8PFdnQ7VCVGXZBgcc6aaWji8q0wt7jrZA26siD1rspvznwTHunf1ttDyBEyhYSNDk16ODb3wGNTwjRK9uDmjOi7qVgmgG3ZBwkJr3CZA3hmfCQkWZBxiKDMWBZCNppqI1GFLqfhGD1tzjSEwTVpeJ0ieDjimpPjnBOHXohfE3K")
  const [credentialsStatus, setCredentialsStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // Load saved settings on component mount
  useEffect(() => {
    loadSavedSettings()
  }, [])

  const loadSavedSettings = async () => {
    try {
      const response = await fetch('/api/settings/facebook')
      const data = await response.json()
      
      if (data.success && data.data) {
        setAppId(data.data.appId || "1500646467976405")
        setAppSecret(data.data.appSecret || "b3cb0095c94e42c9f2f21d4c2d1a1fa2")
        setAccessToken(data.data.accessToken || "")
        
        if (data.data.accounts && data.data.accounts.length > 0) {
          setConnectedAccounts(data.data.accounts)
          setCredentialsStatus('connected')
        }
      }
    } catch (error) {
      console.error('[FacebookSettings] Error loading settings:', error)
    }
  }

  // Test credentials using direct API calls
  const handleTestCredentials = async () => {
    if (!accessToken) {
      toast.error("Access Token é obrigatório")
      return
    }

    setCredentialsStatus('testing')
    setErrorMessage("")

    try {
      console.log('[FacebookCredentials] Testing credentials with direct API calls')
      
      const response = await fetch('/api/facebook/business-test')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Falha na conexão')
      }

      setCredentialsStatus('connected')
      toast.success(`Conexão testada com sucesso! Encontradas ${data.data.campaigns.count} campanhas`)
      
      // Create connected account based on test results
      const connectedAccount: FacebookAccount = {
        id: `act_2086645648498466`,
        name: data.data.account?.name || "Conta de Anúncios Facebook",
        account_id: "2086645648498466",
        currency: data.data.account?.currency || "USD",
        status: 'connected',
        lastSync: new Date().toISOString()
      }
      
      setConnectedAccounts([connectedAccount])
      
    } catch (error) {
      console.error('[FacebookCredentials] Error:', error)
      setCredentialsStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error("Falha na conexão com Facebook")
    }
  }

  const handleSaveCredentials = async () => {
    if (credentialsStatus !== 'connected') {
      toast.error("Teste as credenciais primeiro")
      return
    }

    try {
      // Save to database/settings
      const response = await fetch('/api/settings/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          appSecret,
          accessToken,
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
    setCredentialsStatus('idle')
    toast.success("Conta desconectada")
  }

  const handleSyncAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/facebook/business-metrics')
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Sincronização concluída! ${data.data.length} campanhas atualizadas`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error("Erro na sincronização")
    }
  }

  const handleViewMetrics = () => {
    window.open('/facebook-test', '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          Integração Facebook Ads (API Direta)
        </CardTitle>
        <CardDescription>
          Configure sua conexão com o Facebook Ads usando chamadas diretas à Graph API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Configuração Manual</TabsTrigger>
            <TabsTrigger value="oauth">OAuth (Em Breve)</TabsTrigger>
          </TabsList>
          
          {/* Manual Credentials Method */}
          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Direta:</strong> Usando chamadas diretas à Facebook Graph API para máxima compatibilidade e controle.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-token">Facebook Access Token *</Label>
                <Input
                  id="access-token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Token com permissões ads_read, business_management
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Graph API Explorer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-id">Facebook App ID</Label>
                  <Input
                    id="app-id"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1500646467976405"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-secret">Facebook App Secret</Label>
                  <Input
                    id="app-secret"
                    type="password"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    placeholder="b3cb0095c94e42c9f2f21d4c2d1a1fa2"
                  />
                </div>
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
                  Conexão estabelecida com sucesso usando Facebook Graph API!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleTestCredentials}
                disabled={credentialsStatus === 'testing' || !accessToken}
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

              {credentialsStatus === 'connected' && (
                <Button 
                  onClick={handleViewMetrics}
                  variant="secondary"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Métricas
                </Button>
              )}
            </div>
          </TabsContent>

          {/* OAuth Method - Coming Soon */}
          <TabsContent value="oauth" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <Facebook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">OAuth em Desenvolvimento</p>
              <p className="text-sm">
                Login automático com Facebook será disponibilizado em breve
              </p>
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
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Facebook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {account.account_id} • {account.currency}
                        </div>
                        <div className="text-xs text-green-600">
                          ✓ Conectado via Graph API
                        </div>
                        {account.lastSync && (
                          <div className="text-xs text-muted-foreground">
                            Última sincronização: {new Date(account.lastSync).toLocaleString('pt-BR')}
                          </div>
                        )}
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
                        onClick={handleViewMetrics}
                      >
                        <Eye className="h-4 w-4" />
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