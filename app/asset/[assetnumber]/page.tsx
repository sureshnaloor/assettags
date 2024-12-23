'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import AssetDetails from '@/app/components/AssetDetails';
import CalibrationDetails from '@/app/components/CalibrationDetails';
import CustodyDetails from '@/app/components/CustodyDetails';
import Footer from '@/app/components/Footer';
import { AssetData, CalibrationCertificate } from '@/types/asset';

export default function AssetPage({ params }: { params: { assetnumber: string } }) {
  const router = useRouter();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [calibrations, setCalibrations] = useState<CalibrationCertificate[]>([]);
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
        // Add new fields
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

    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
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
        
        <main className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
          <AssetDetails 
            asset={asset} 
            onUpdate={handleAssetUpdate}
          />
          <CalibrationDetails 
            calibration={calibrations[0]}
            onUpdate={(updatedCalibration) => {
              setCalibrations(currentCalibrations => 
                currentCalibrations.map(cal => 
                  cal._id === updatedCalibration._id ? updatedCalibration : cal
                )
              );
            }}
          />
          <CustodyDetails custodyRecords={custodyRecords} />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}