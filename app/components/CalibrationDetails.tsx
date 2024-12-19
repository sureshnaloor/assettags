'use client';
import { useState, useEffect } from 'react';
import { Calibration } from '@/types/asset';

interface CalibrationDetailsProps {
  calibrations: Calibration[];
}

export default function CalibrationDetails({ calibrations }: CalibrationDetailsProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [flashCount, setFlashCount] = useState(0);
  const MAX_FLASHES = 9;

  useEffect(() => {
    if (calibrations?.length > 0) {
      const isExpired = new Date(calibrations[0].calibrationtodate) < new Date();
      if (isExpired && flashCount < MAX_FLASHES) {
        setShowFlash(true);
        const timer = setTimeout(() => {
          setShowFlash(false);
          setFlashCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [calibrations, flashCount]);

  return (
    <div className="bg-sky-800/80 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl">
      <h2 className="text-sm font-semibold mb-2 text-blue-200">Calibration Details</h2>
      
      {showFlash && calibrations.length > 0 && 
       new Date(calibrations[0].calibrationtodate) < new Date() && (
        <div className="animate-pulse bg-red-500/20 text-red-100 px-4 py-2 rounded-md mb-2 text-center">
          ⚠️ Equipment Calibration Has Expired ⚠️
        </div>
      )}
      
      {calibrations.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2 shadow-md ring-1 ring-slate-700/50">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-teal-100">Certificate Number</label>
                <div className="text-[12px] text-zinc-100">
                  {calibrations[0].calibcertificate}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Calibrated By</label>
                <div className="text-[12px] text-zinc-100">
                  {calibrations[0].calibratedby}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Calibration Date</label>
                <div className="text-[12px] text-zinc-100">
                  {new Date(calibrations[0].calibrationdate).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Valid Until</label>
                <div className={`${
                  new Date(calibrations[0].calibrationtodate) < new Date()
                    ? 'text-red-400 font-bold'
                    : 'text-zinc-100'
                } text-[12px]`}>
                  {new Date(calibrations[0].calibrationtodate).toLocaleDateString()}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-teal-100">Status</label>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  new Date(calibrations[0].calibrationtodate) > new Date()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800 font-bold animate-pulse'
                }`}>
                  {new Date(calibrations[0].calibrationtodate) > new Date()
                    ? 'Valid'
                    : 'EXPIRED'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">PO Reference</label>
                <div className="text-[12px] text-zinc-100">
                  {calibrations[0].calibrationpo}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">File Reference</label>
                <div className="text-[12px] text-zinc-100">
                  {calibrations[0].calibfile}
                </div>
              </div>
            </div>
          </div>

          {calibrations.length > 1 && (
            <button className="text-xs text-blue-300 hover:text-blue-200 transition-colors">
              View Calibration History ({calibrations.length - 1} previous records)
            </button>
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-300">
          No calibration records found for this asset.
        </div>
      )}
    </div>
  );
} 