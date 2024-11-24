import Image from "next/image";

type AssetCategory = "IT & Electronics" | "Measuring instruments";
const assetCategory: AssetCategory = "Measuring instruments";

type CustodyLocation = "warehouse" | "in use";
const custodyLocation: CustodyLocation = "in use";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      {/* Background image - changed to min-h-screen and made it fixed */}
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      {/* Content wrapper - add relative and bg-transparent */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full bg-blue-950/50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="text-sm sm:text-base md:text-xl font-semibold p-2 sm:p-3 md:p-4">
              Asset Tags
            </div>
            
            <div className="relative w-40 sm:w-52 md:w-64 h-12 sm:h-16 md:h-20">
              <Image
                src="/images/logo.jpg"
                alt="JAL Logo"
                fill
                className="object-contain opacity-80"
                priority
              />
            </div>
            
            <div className="text-sm sm:text-base md:text-xl font-semibold p-2 sm:p-3 md:p-4">
              JAL International Co Ltd
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
          {/* Main Asset Card */}
          <div className="bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl">
            <div className="grid grid-cols-2 gap-2">
              {/* Asset Number */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2 shadow-md ring-1 ring-slate-700/50">
                <label className="block text-xs font-medium text-zinc-400">Asset Number</label>
                <div className="text-sm font-bold text-zinc-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  AST-2024-001
                </div>
              </div>

              {/* Asset Description */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2 shadow-md ring-1 ring-slate-700/50">
                <label className="block text-xs font-medium text-zinc-400">Asset Description</label>
                <div className="text-sm font-semibold text-zinc-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  Dell Latitude 5420 Laptop with 16GB RAM and 512GB SSD
                </div>
              </div>

              {/* Other details in 3-column grid on larger screens */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {/* Acquisition Date */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-medium text-zinc-400">Acquisition Date</label>
                  <div className="text-sm">March 15, 2024</div>
                </div>

                {/* Acquisition Value */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-medium text-zinc-400">Acquisition Value</label>
                  <div className="text-sm">$1,299.99</div>
                </div>

                {/* Asset Category */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-medium text-zinc-400">Asset Category</label>
                  <div className="text-sm">Measuring instruments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Custodian Card */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl">
            <h2 className="text-sm font-semibold mb-2 text-blue-200">Custodian Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Custody Location - Always shown */}
              <div className="space-y-0.5">
                <label className="block text-xs font-medium text-zinc-400">Custody Location</label>
                <div className="text-xs sm:text-sm">{custodyLocation}</div>
              </div>

              {custodyLocation === "warehouse" ? (
                <>
                  {/* Warehouse specific fields */}
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Warehouse Location</label>
                    <div className="text-xs sm:text-sm">Main Warehouse</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Warehouse Custodian</label>
                    <div className="text-xs sm:text-sm">John Smith</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Room/Rack/Bin</label>
                    <div className="text-xs sm:text-sm">R12/B3/S4</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Custody From</label>
                    <div className="text-xs sm:text-sm">2024-01-15</div>
                  </div>
                </>
              ) : (
                <>
                  {/* In Use specific fields */}
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Project Name</label>
                    <div className="text-xs sm:text-sm">115 KV Substation, Tuwaiq</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Project Location</label>
                    <div className="text-xs sm:text-sm">Riyadh, Saudi Arabia</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Department/BU</label>
                    <div className="text-xs sm:text-sm">Electrical Department</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Custodian Emp Number</label>
                    <div className="text-xs sm:text-sm">3999</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Custodian Name</label>
                    <div className="text-xs sm:text-sm">John Doe</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Custody From</label>
                    <div className="text-xs sm:text-sm">2024-01-15</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Calibration Cards */}
          {assetCategory === "Measuring instruments" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-4xl">
              {/* Calibration Details Card */}
              <div className="bg-indigo-950/20 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <h2 className="text-sm font-semibold mb-2 text-blue-200">Calibration Details</h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Technical Name</label>
                    <div className="text-xs sm:text-sm">Digital Multimeter</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Manufacturer</label>
                    <div className="text-xs sm:text-sm">Fluke Corporation</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Model</label>
                    <div className="text-xs sm:text-sm">Fluke 87V</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Serial Number</label>
                    <div className="text-xs sm:text-sm">SN-2024-456789</div>
                  </div>
                </div>
              </div>

              {/* Calibration Certificate Card */}
              <div className="bg-indigo-950/20 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <h2 className="text-sm font-semibold mb-2 text-blue-200">Calibration Certificate</h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Status</label>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Calibrated
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Last Calibration</label>
                    <div className="text-xs sm:text-sm">January 15, 2024</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Next Due Date</label>
                    <div className="text-xs sm:text-sm">January 15, 2025</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Certificate Number</label>
                    <div className="text-xs sm:text-sm">CAL-2024-123</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-xs font-medium text-zinc-400">Calibration record</label>
                    <div className="text-xs sm:text-sm">2024-01-15</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
