import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface WeatherMapProps {
  lat: number;
  lon: number;
  cityName: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ lat, lon, cityName }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with demo token (users should replace with their own)
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVzdCIsImEiOiJjbGhsNDBjZXkwMXR5M2ltMGxydWR0bm1xIn0.demo'; // Demo token
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lon, lat],
        zoom: 10,
      });

      // Add marker for the city
      new mapboxgl.Marker({ color: 'hsl(210, 80%, 50%)' })
        .setLngLat([lon, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div class="p-2 font-medium">${cityName}</div>`)
        )
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.warn('Mapbox failed to load, using fallback display');
      // Fallback content when Mapbox fails
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gradient-card rounded-lg">
            <div class="text-center">
              <div class="text-2xl mb-2">📍</div>
              <div class="font-medium">${cityName}</div>
              <div class="text-sm text-muted-foreground">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</div>
              <div class="text-xs text-muted-foreground mt-2">Map requires valid Mapbox token</div>
            </div>
          </div>
        `;
      }
    }

    return () => {
      map.current?.remove();
    };
  }, [lat, lon, cityName]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      <div ref={mapContainer} className="w-full h-64 rounded-lg overflow-hidden" />
    </Card>
  );
};

export default WeatherMap;