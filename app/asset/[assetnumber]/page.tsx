'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

import AssetDetails from '@/app/components/AssetDetails';
import CalibrationDetails from '@/app/components/CalibrationDetails';
import CustodyDetails from '@/app/components/CustodyDetails';


import { AssetData, Calibration } from '@/types/asset';

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

  const handleCalibrationUpdate = async (calibration: Calibration) => {
    try {
      const response = await fetch(`/api/calibrations/${params.assetnumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...calibration,
          createdby: 'current-user', // Replace with actual user
          createdat: new Date(),
          calibrationfromdate: calibration.calibrationdate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update calibration');
      }
      // Update local state with new calibration data
      const updatedCalibration = await response.json();
      setCalibrations(prevCalibrations => 
        prevCalibrations.map(cal => 
          cal._id === updatedCalibration._id ? updatedCalibration : cal
        )
      );

      console.log('Calibration updated successfully');
    } catch (error) {
      console.error('Failed to update calibration:', error);
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
            currentCalibration={calibrations[0]}
            calibrationHistory={calibrations.slice(1)}
            onUpdate={(updatedCalibration) => {
              if (updatedCalibration === null) {
                setCalibrations([]); 
              } else {
                setCalibrations(currentCalibrations =>
                  currentCalibrations.map(cal => 
                    cal._id === updatedCalibration._id ? updatedCalibration : cal
                  )
                );
              }
            }}
          />
          <CustodyDetails custodyRecords={custodyRecords} />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}