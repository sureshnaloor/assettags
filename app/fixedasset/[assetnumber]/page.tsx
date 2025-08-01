'use client';
import { useState, useEffect } from 'react';
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
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
      
        
        <main className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
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
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 mt-4"
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