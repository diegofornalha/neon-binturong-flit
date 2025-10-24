"use client"

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CityData {
  city: string;
  clicks: number;
  lat: number;
  lng: number;
}

interface GeoMapChartProps {
  cities: CityData[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const center = {
  lat: -14.235,
  lng: -51.925
};

export function GeoMapChart({ cities }: GeoMapChartProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader><CardTitle>Mapa de Cliques por Cidade</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Mapa de Cliques por Cidade</CardTitle></CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={4}
        >
          {cities.map((city) => (
            <Marker
              key={city.city}
              position={{ lat: city.lat, lng: city.lng }}
              title={`${city.city}: ${city.clicks} cliques`}
            />
          ))}
        </GoogleMap>
      </CardContent>
    </Card>
  )
}