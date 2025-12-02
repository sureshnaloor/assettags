'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

import AssetDetails from '../../components/AssetDetails';
import CustodyDetails from '../../components/CustodyDetails';
import { AssetData } from '@/types/asset';
import { Custody } from '@/types/custody';
import { useRouter } from 'next/navigation';

import CollapsibleSection from '@/app/components/CollapsibleSection';

interface PageParams {
  assetnumber: string;
}

export default function FixedAssetPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  const router = useRouter();
  const params = useParams();
  const assetnumber = params?.assetnumber as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [custodyRecords, setCustodyRecords] = useState<Custody[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setLoading(true);
        const assetResponse = await fetch(`/api/fixedassets/${params?.assetnumber}`);
        if (!assetResponse.ok) throw new Error('Failed to fetch asset');
        const assetData = await assetResponse.json();
        setAsset(assetData);

        // Fetch custody records
        const custodyResponse = await fetch(`/api/custody/${params?.assetnumber}`);
        if (!custodyResponse.ok) throw new Error('Failed to fetch custody records');
        const custodyData = await custodyResponse.json();
        setCustodyRecords(custodyData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [params?.assetnumber]);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.fill();

        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleAssetUpdate = async (updatedAsset: Partial<AssetData>): Promise<void> => {
    try {
      console.log('Updating fixed asset:', params?.assetnumber);

      // Updated payload to include new fields
      const updatePayload = {
        assetcategory: updatedAsset.assetcategory,
        assetsubcategory: updatedAsset.assetsubcategory,
        assetstatus: updatedAsset.assetstatus,
        assetnotes: updatedAsset.assetnotes,
        
        assetmodel: updatedAsset.assetmodel,
        assetmanufacturer: updatedAsset.assetmanufacturer,
        assetserialnumber: updatedAsset.assetserialnumber,
        accessories: updatedAsset.accessories,
        legacyassetnumber: updatedAsset.legacyassetnumber,
        anyotheridentifier: updatedAsset.anyotheridentifier,
      };

      const res = await fetch(`/api/fixedassets/${params?.assetnumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Update failed:', {
          status: res.status,
          statusText: res.statusText,
          data
        });
        throw new Error(data.error || `Failed to update fixed asset: ${res.status}`);
      }

      // Update local state with new data
      setAsset(prevAsset => {
        if (!prevAsset) return data;
        return { 
          ...prevAsset, 
          ...updatePayload
        };
      });

      console.log('Fixed asset updated successfully');
      // for testing only, will be removed later in production
      console.log('Updated Fixed Asset:', asset);

    } catch (error) {
      console.error('Error updating fixed asset:', error);
      throw error;
    }
  };

  const handleLogLocation = () => {
    router.push(`/loglocation?asset=${assetnumber}&source=fixedasset`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      <div className="relative z-20 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 gap-4">
          {asset && (
            <CollapsibleSection title="Asset Details">
              <AssetDetails 
                asset={asset} 
                onUpdate={handleAssetUpdate}
              />
            </CollapsibleSection>
          )}
          <CollapsibleSection title="Custody Details">
            <CustodyDetails 
              currentCustody={custodyRecords.length > 0 ? custodyRecords[0] : null}
              custodyHistory={custodyRecords.length > 1 ? custodyRecords.slice(1) : []}
              onUpdate={(updatedCustody) => {
                if (updatedCustody) {
                  setCustodyRecords(prev => [updatedCustody, ...prev.slice(1)]);
                }
              }}
              assetnumber={assetnumber}
            />
          </CollapsibleSection>

          <button
            onClick={handleLogLocation}
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-xl shadow-lg transition-colors duration-200 flex items-center gap-2 mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Log Location
          </button>
        </main>
      </div>
    </div>
  );
}