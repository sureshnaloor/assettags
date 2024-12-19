import Header from '@/app/components/Header';
import AssetDetails from '@/app/components/AssetDetails';
import CalibrationDetails from '@/app/components/CalibrationDetails';
import CustodyDetails from '@/app/components/CustodyDetails';
import Footer from '@/app/components/Footer';

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

async function getAsset(assetnumber: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/assets/${assetnumber}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch asset: ${res.status}`);
  }
  
  return res.json();
}

async function getCalibrations(assetnumber: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/calibrations/${assetnumber}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return []; // Return empty array if no calibrations
  }
  
  return res.json();
}

async function getCustody(assetnumber: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/custody/${assetnumber}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return []; // Return empty array if no custody records
  }
  
  return res.json();
}

export default async function AssetPage({ params }: { params: { assetnumber: string } }) {
  try {
    const asset = await getAsset(params.assetnumber);
    const calibrations = await getCalibrations(params.assetnumber);
    const custodyRecords = await getCustody(params.assetnumber);

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