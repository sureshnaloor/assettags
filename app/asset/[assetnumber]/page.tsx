import Header from '@/app/components/Header';
import AssetDetails from '@/app/components/AssetDetails';
import CalibrationDetails from '@/app/components/CalibrationDetails';
import CustodyDetails from '@/app/components/CustodyDetails';
import Footer from '@/app/components/Footer';
import { headers } from 'next/headers';

// Helper function to get API URL
function getApiUrl(path: string) {
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host') || 'localhost:3000';
  return `${protocol}://${host}${path}`;
}

async function getAsset(assetnumber: string) {
  console.log('Fetching asset:', assetnumber);
  
  try {
    const res = await fetch(getApiUrl(`/api/assets/${assetnumber}`), {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error('Asset fetch error:', {
        status: res.status,
        statusText: res.statusText
      });
      throw new Error(`Failed to fetch asset: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Asset fetch error:', error);
    throw error;
  }
}

async function getCalibrations(assetnumber: string) {
  try {
    const res = await fetch(getApiUrl(`/api/calibrations/${assetnumber}`), {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok && res.status !== 404) {
      console.error('Calibrations fetch error:', res.statusText);
    }
    
    return res.ok ? res.json() : [];
  } catch (error) {
    console.error('Calibrations fetch error:', error);
    return [];
  }
}

async function getCustody(assetnumber: string) {
  try {
    const res = await fetch(getApiUrl(`/api/custody/${assetnumber}`), {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok && res.status !== 404) {
      console.error('Custody fetch error:', res.statusText);
    }
    
    return res.ok ? res.json() : [];
  } catch (error) {
    console.error('Custody fetch error:', error);
    return [];
  }
}

export default async function AssetPage({ params }: { params: { assetnumber: string } }) {
  try {
    console.log('Fetching data for asset:', params.assetnumber);
    
    const [asset, calibrations, custodyRecords] = await Promise.all([
      getAsset(params.assetnumber),
      getCalibrations(params.assetnumber),
      getCustody(params.assetnumber)
    ]);

    return (
      <div className="relative flex flex-col min-h-screen text-zinc-100">
        <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
            <AssetDetails asset={asset} />
            <CalibrationDetails calibrations={calibrations} />
            <CustodyDetails custodyRecords={custodyRecords} />
          </main>
          
          <Footer />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in AssetPage:', error);
    throw error;
  }
}