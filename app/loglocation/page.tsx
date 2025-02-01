'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function LocationContent() {
  const searchParams = useSearchParams();
  const assetNumber = searchParams?.get('asset') || null;
  const source = searchParams?.get('source') || 'asset';
  
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; location: { lat: number; lng: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError('Error getting location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleLogLocation = async () => {
    if (!assetNumber || !currentPosition) return;

    try {
      setLoading(true);
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetNumber,
          latitude: selectedPlace?.location.lat || currentPosition.lat,
          longitude: selectedPlace?.location.lng || currentPosition.lng,
          landmark: selectedPlace?.name,
          timestamp: new Date(),
        }),
      });

      if (!response.ok) throw new Error('Failed to log location');
      
      // Redirect based on source
      window.location.href = `/${source}/${assetNumber}`;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to log location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <h1 className="text-2xl font-bold mb-4">Log Location for Asset {assetNumber}</h1>
      
      {error && (
        <div className="bg-red-500/50 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {currentPosition && (
        <div className="h-[400px] mb-4">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentPosition}
              zoom={15}
            >
              <Marker position={currentPosition} />
            </GoogleMap>
          </LoadScript>
        </div>
      )}

      <button
        onClick={handleLogLocation}
        disabled={loading || !currentPosition}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Logging...' : 'Log Current Location'}
      </button>
    </div>
  );
}

export default function LogLocationPage() {
  return (
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Suspense fallback={
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <LocationContent />
          </Suspense>
        </main>
        
        
      </div>
    </div>
  );
}