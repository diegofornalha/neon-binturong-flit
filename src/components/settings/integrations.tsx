"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Facebook, Chrome } from "lucide-react"

export function IntegrationsSettings() {
  const [facebookConnected, setFacebookConnected] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [facebookAppId, setFacebookAppId] = useState("")
  const [facebookAppSecret, setFacebookAppSecret] = useState("")
  const [googleClientId, setGoogleClientId] = useState("")
  const [googleClientSecret, setGoogleClientSecret] = useState("")

  const handleConnectFacebook = () => {
    // In a real app, this would initiate OAuth flow
    console.log("[Integrations] Connecting Facebook")
    setFacebookConnected(true)
    toast.success("Facebook connected successfully")
  }

  const handleConnectGoogle = () => {
    // In a real app, this would initiate OAuth flow
    console.log("[Integrations] Connecting Google")
    setGoogleConnected(true)
    toast.success("Google connected successfully")
  }

  const handleSaveCredentials = () => {
    // In a real app, this would save credentials to your database
    console.log("[Integrations] Saving credentials")
    toast.success("Credentials saved successfully")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Integrations</CardTitle>
        <CardDescription>
          Connect your advertising platforms to sync campaign data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Facebook className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Facebook Ads</h3>
              <p className="text-sm text-muted-foreground">
                {facebookConnected 
                  ? "Connected" 
                  : "Connect to sync Facebook Ads data"}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleConnectFacebook}
            variant={facebookConnected ? "outline" : "default"}
          >
            {facebookConnected ? "Reconnect" : "Connect"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Chrome className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Google Ads</h3>
              <p className="text-sm text-muted-foreground">
                {googleConnected 
                  ? "Connected" 
                  : "Connect to sync Google Ads data"}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleConnectGoogle}
            variant={googleConnected ? "outline" : "default"}
          >
            {googleConnected ? "Reconnect" : "Connect"}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">API Credentials</h3>
          <p className="text-sm text-muted-foreground">
            Enter your platform API credentials for direct integration
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-app-id">Facebook App ID</Label>
              <Input
                id="facebook-app-id"
                value={facebookAppId}
                onChange={(e) => setFacebookAppId(e.target.value)}
                placeholder="Enter Facebook App ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook-app-secret">Facebook App Secret</Label>
              <Input
                id="facebook-app-secret"
                type="password"
                value={facebookAppSecret}
                onChange={(e) => setFacebookAppSecret(e.target.value)}
                placeholder="Enter Facebook App Secret"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google-client-id">Google Client ID</Label>
              <Input
                id="google-client-id"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="Enter Google Client ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google-client-secret">Google Client Secret</Label>
              <Input
                id="google-client-secret"
                type="password"
                value={googleClientSecret}
                onChange={(e) => setGoogleClientSecret(e.target.value)}
                placeholder="Enter Google Client Secret"
              />
            </div>
          </div>
          
          <Button onClick={handleSaveCredentials}>
            Save Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}