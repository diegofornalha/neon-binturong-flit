"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Image as ImageIcon, Video, Search, Eye, ExternalLink, Play } from "lucide-react"
import { toast } from "sonner"
import { CreativeViewer } from "./creative-viewer"

interface Ad {
  id: string
  name: string
  adset_id: string
  campaign_id: string
  status: string
  effective_status: string
  creative?: {
    id: string
    name: string
    title?: string
    body?: string
    image_url?: string
    video_id?: string
    thumbnail_url?: string
    call_to_action_type?: string
  }
}

export function AdsGallery() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedAd, setSelectedAd] = useState<{ id: string; name: string } | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    loadAds()
  }, [])

  const loadAds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/facebook/creatives')
      const data = await response.json()
      
      if (data.success) {
        setAds(data.data || [])
      } else {
        toast.error(data.error || "Erro ao carregar anúncios")
      }
    } catch (error) {
      toast.error("Erro ao carregar anúncios")
    } finally {
      setLoading(false)
    }
  }

  const filteredAds = ads.filter(ad => 
    ad.name.toLowerCase().includes(search.toLowerCase()) ||
    ad.creative?.title?.toLowerCase().includes(search.toLowerCase()) ||
    ad.creative?.body?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdInFacebook = (adId: string) => {
    window.open(`https://www.facebook.com/ads/library/?id=${adId}`, '_blank')
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Galeria de Criativos</CardTitle>
              <CardDescription>
                Visualize todos os criativos de anúncios ativos
              </CardDescription>
            </div>
            <Button onClick={loadAds} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, título ou texto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum anúncio encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAds.map((ad) => (
                <Card 
                  key={ad.id} 
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Creative Preview */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden group">
                      {ad.creative?.video_id && playingVideo === ad.id ? (
                        <div className="w-full h-full">
                          <iframe
                            src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${ad.creative.video_id}/&show_text=false&width=500`}
                            className="w-full h-full"
                            style={{ border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          />
                        </div>
                      ) : ad.creative?.image_url ? (
                        <>
                          <img 
                            src={ad.creative.image_url} 
                            alt={ad.name}
                            className="w-full h-full object-cover"
                          />
                          {ad.creative?.video_id && (
                            <div 
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => setPlayingVideo(ad.id)}
                            >
                              <div className="bg-white rounded-full p-4">
                                <Play className="h-8 w-8 text-blue-600" fill="currentColor" />
                              </div>
                            </div>
                          )}
                        </>
                      ) : ad.creative?.thumbnail_url ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={ad.creative.thumbnail_url} 
                            alt={ad.name}
                            className="w-full h-full object-cover"
                          />
                          <div 
                            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                            onClick={() => setPlayingVideo(ad.id)}
                          >
                            <div className="bg-white rounded-full p-4">
                              <Play className="h-8 w-8 text-blue-600" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Ad Info */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                        {ad.name}
                      </h3>
                      
                      {ad.creative?.title && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ad.creative.title}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={ad.effective_status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {ad.effective_status}
                        </Badge>
                        {ad.creative?.video_id && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Vídeo
                          </Badge>
                        )}
                        {ad.creative?.call_to_action_type && (
                          <Badge variant="outline" className="text-xs">
                            {ad.creative.call_to_action_type}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedAd({ id: ad.id, name: ad.name })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => openAdInFacebook(ad.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                      </div>

                      {playingVideo === ad.id && ad.creative?.video_id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setPlayingVideo(null)}
                        >
                          Fechar Vídeo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creative Viewer Dialog */}
      {selectedAd && (
        <CreativeViewer
          adId={selectedAd.id}
          adName={selectedAd.name}
          open={!!selectedAd}
          onClose={() => setSelectedAd(null)}
        />
      )}
    </>
  )
}