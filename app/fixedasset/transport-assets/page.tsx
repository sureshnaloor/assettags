'use client';

export default function TransportAssetsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent mb-2">
            Transport Assets
          </h1>
          <p className="text-white/80 text-lg">
            Search and manage transport fixed assets (numbers starting with 30).
          </p>
        </div>
      </div>
    </div>
  );
}
