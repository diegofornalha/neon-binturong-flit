"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Image as ImageIcon, Video, ExternalLink, Copy, Play } from "lucide-react"
import { toast } from "sonner"

interface CreativeViewerProps {
  adId: string
  adName: string
  open: boolean
  onClose: () => void
}

export function CreativeViewer({ adId, adName, open, onClose }: CreativeViewerProps) {
  const [loading, setLoading] = useState(false)
  const [creative, setCreative] = useState<any>(null)
  const [playVideo, setPlayVideo] = useState(false)

  useEffect(() => {
    if (open && !creative) {
      loadCreative()
    }
  }, [open])

  const loadCreative = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/facebook/creatives?adId=${adId}`)
      const data = await response.json()
      
      if (data.success) {
        setCreative(data.data)
      } else {
        toast.error(data.error || "Erro ao carregar criativo")
      }
    } catch (error) {
      toast.error("Erro ao carregar criativo")
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setPlayVideo(false)
      onClose()
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Texto copiado!")
  }

  const openInFacebook = () => {
    window.open(`https://www.facebook.com/ads/library/?id=${adId}`, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Detalhes do Criativo
              </DialogTitle>
              <DialogDescription>{adName}</DialogDescription>
            </div>
            <Button variant="outline" onClick={openInFacebook}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver no Facebook
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : creative ? (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={creative.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {creative.status}
              </Badge>
              <Badge variant="outline">{creative.effective_status}</Badge>
              {creative.creative?.call_to_action_type && (
                <Badge variant="outline">{creative.creative.call_to_action_type}</Badge>
              )}
            </div>

            {/* Creative Content */}
            {creative.creative && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Media */}
                <div className="space-y-4">
                  {/* Video */}
                  {creative.creative.video_id && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Vídeo
                          </h3>
                          {playVideo ? (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <iframe
                                src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${creative.creative.video_id}/&show_text=false&width=500`}
                                className="w-full h-full"
                                style={{ border: 'none' }}
                                scrolling="no"
                                frameBorder="0"
                                allowFullScreen={true}
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                              />
                            </div>
                          ) : (
                            <div 
                              className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer group"
                              onClick={() => setPlayVideo(true)}
                            >
                              {creative.creative.thumbnail_url ? (
                                <>
                                  <img 
                                    src={creative.creative.thumbnail_url} 
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                    <div className="bg-white rounded-full p-4">
                                      <Play className="h-8 w-8 text-blue-600" fill="currentColor" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <Play className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500">Clique para reproduzir</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Video ID: {creative.creative.video_id}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Image */}
                  {creative.creative.image_url && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Imagem
                          </h3>
                          <img 
                            src={creative.creative.image_url} 
                            alt={creative.creative.name || "Creative"}
                            className="w-full rounded-lg border"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right: Text Content */}
                <div className="space-y-4">
                  {/* Title */}
                  {creative.creative.title && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Título</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyText(creative.creative.title)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg">
                            {creative.creative.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Body */}
                  {creative.creative.body && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Texto do Anúncio</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyText(creative.creative.body)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {creative.creative.body}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* IDs */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold">Identificadores</h3>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-muted-foreground mb-1">Creative ID</p>
                            <p className="font-mono text-xs">{creative.creative.id}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-muted-foreground mb-1">Ad ID</p>
                            <p className="font-mono text-xs">{creative.id}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-muted-foreground mb-1">Campaign ID</p>
                            <p className="font-mono text-xs">{creative.campaign_id}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum criativo encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}