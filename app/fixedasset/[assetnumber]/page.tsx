'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AssetDetails from '../../components/AssetDetails';
import CustodyDetails from '../../components/CustodyDetails';
import { AssetData } from '@/types/asset';
import { Custody } from '@/types/custody';

import CollapsibleSection from '@/app/components/CollapsibleSection';

export default function FixedAssetPage() {
  const params = useParams();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [custodyRecords, setCustodyRecords] = useState<Custody[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setLoading(true);
        // Fetch asset details
        const assetResponse = await fetch(`/api/fixedassets/${params.assetnumber}`);
        if (!assetResponse.ok) throw new Error('Failed to fetch asset');
        const assetData = await assetResponse.json();
        setAsset(assetData);

        // Fetch custody records
        const custodyResponse = await fetch(`/api/custody/${params.assetnumber}`);
        if (!custodyResponse.ok) throw new Error('Failed to fetch custody records');
        const custodyData = await custodyResponse.json();
        setCustodyRecords(custodyData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (params.assetnumber) {
      fetchAssetData();
    }
  }, [params.assetnumber]);

  const handleAssetUpdate = async (updatedAsset: Partial<AssetData>): Promise<void> => {
    setAsset(updatedAsset as AssetData);
  };

  return (
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
          {asset && (
            <CollapsibleSection title="Asset Details">
            <AssetDetails 
              asset={asset} 
              onUpdate={handleAssetUpdate}
            />
            </CollapsibleSection>
          )
          }
          <CollapsibleSection title="Custody Details">
          <CustodyDetails 
            currentCustody={custodyRecords.length > 0 ? custodyRecords[0] : null}
            custodyHistory={custodyRecords.length > 1 ? custodyRecords.slice(1) : []}
            onUpdate={(updatedCustody) => {
              if (updatedCustody) {
                setCustodyRecords(prev => [updatedCustody, ...prev.slice(1)]);
              }
            }}
            assetnumber={params.assetnumber as string}
          />
          </CollapsibleSection>
        </main>
        
        <Footer />
      </div>
    </div>
  );
} 