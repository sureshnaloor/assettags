'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

import AssetDetails from '@/app/components/AssetDetails';
import CalibrationDetails from '@/app/components/CalibrationDetails';
import CustodyDetails from '@/app/components/CustodyDetails';


import { AssetData, Calibration } from '@/types/asset';
import { Custody } from '@/types/custody';

import CollapsibleSection from '@/app/components/CollapsibleSection';

export default function AssetPage({ params }: { params: { assetnumber: string } }) {
  const router = useRouter();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [custodyRecords, setCustodyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [params.assetnumber]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assetData, calibrationData, custodyData] = await Promise.all([
        fetch(`/api/assets/${params.assetnumber}`).then(res => res.json()),
        fetch(`/api/calibrations/${params.assetnumber}`).then(res => res.json()),
        fetch(`/api/custody/${params.assetnumber}`).then(res => res.json())
      ]);

      setAsset(assetData);
      setCalibrations(calibrationData);
      setCustodyRecords(custodyData);

        // for testing only, will be removed later in production
      console.log('Calibrations:', calibrations);
      console.log('Custody Records:', custodyRecords);
      console.log('Asset:', asset);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetUpdate = async (updatedAsset: Partial<AssetData>) => {
    try {
      console.log('Updating asset:', params.assetnumber);

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

      const res = await fetch(`/api/assets/${params.assetnumber}`, {
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
        throw new Error(data.error || `Failed to update asset: ${res.status}`);
      }

      // Update local state with new data
      setAsset(prevAsset => {
        if (!prevAsset) return data;
        return { 
          ...prevAsset, 
          ...updatePayload
        };
      });

      console.log('Asset updated successfully');
      // for testing only, will be removed later in production
      console.log('Updated Asset:', asset);

    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  };

  const handleCalibrationUpdate = async (calibration: Calibration | null) => {
    try {
      if (!calibration) return;
      const response = await fetch(`/api/calibrations/${params.assetnumber}`);
      if (!response.ok) throw new Error('Failed to fetch updated calibrations');
      const newCalibrationData = await response.json();
      setCalibrations(newCalibrationData);
    } catch (error) {
      console.error('Error updating calibrations:', error);
    }
  };

  const handleCustodyUpdate = async (custody: Custody | null) => {
    try {
      // Refresh the custody records
      const response = await fetch(`/api/custody/${params.assetnumber}`);
      if (!response.ok) throw new Error('Failed to fetch custody records');
      const updatedRecords = await response.json();
      
      setCustodyRecords(updatedRecords);
    } catch (error) {
      console.error('Error updating custody records:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error || 'Asset not found'}</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex flex-col items-center justify-center p-2 gap-4">
          <CollapsibleSection title="Asset Details">
            <AssetDetails 
              asset={asset} 
              onUpdate={handleAssetUpdate}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Calibration Details">
            <CalibrationDetails 
              currentCalibration={Array.isArray(calibrations) && calibrations.length > 0 ? calibrations[0] : null}
              calibrationHistory={Array.isArray(calibrations) && calibrations.length > 1 ? calibrations.slice(1) : []}
              onUpdate={handleCalibrationUpdate}
              assetnumber={params.assetnumber} 
            />
          </CollapsibleSection>

          <CollapsibleSection title="Custody Details">
            <CustodyDetails 
              currentCustody={custodyRecords.length > 0 ? custodyRecords[0] : null}
              custodyHistory={custodyRecords.length > 1 ? custodyRecords.slice(1) : []}
              onUpdate={handleCustodyUpdate}
              assetnumber={params.assetnumber}
            />
          </CollapsibleSection>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}