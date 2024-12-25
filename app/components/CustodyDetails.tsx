'use client';
import { useState } from 'react';
import { Custody } from '@/types/custody';

interface CustodyDetailsProps {
  custodyRecords: Custody[];
}

export default function CustodyDetails({ custodyRecords }: CustodyDetailsProps) {
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistory = () => setShowHistory(!showHistory);

  return (
    <div className="bg-emerald-800/80 backdrop-blur-sm rounded-lg shadow-lg z-[-50] p-3 w-full max-w-4xl">
      <h2 className="text-sm font-semibold mb-2 text-emerald-200">Custody Details</h2>
      
      {custodyRecords.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2 shadow-md ring-1 ring-slate-700/50">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-teal-100">Custodian</label>
                <div className="text-sm font-bold text-zinc-100">
                  {custodyRecords[0].custodianempname}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Employee #{custodyRecords[0].custodianempno}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Department</label>
                <div className="text-[12px] text-zinc-100">
                  {custodyRecords[0].department}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Location</label>
                <div className="text-[12px] text-zinc-100">
                  {custodyRecords[0].location}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Rack Location</label>
                <div className="text-[12px] text-zinc-100">
                  {custodyRecords[0].racklocation}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Custody From</label>
                <div className="text-[12px] text-zinc-100">
                  {new Date(custodyRecords[0].custodyfrom).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-teal-100">Created By</label>
                <div className="text-[12px] text-zinc-100">
                  {custodyRecords[0].createdby}
                  <span className="text-[10px] text-zinc-400 ml-1">
                    on {new Date(custodyRecords[0].createdate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showHistory && custodyRecords.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-emerald-200 mt-2">Previous Records</h3>
              {custodyRecords.slice(1).map((record) => (
                <div 
                  key={record._id}
                  className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-md p-2 shadow-md ring-1 ring-slate-700/30"
                >
                  <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-teal-800/30 to-teal-900/30 rounded-md p-2 shadow-md ring-1 ring-slate-700/30">
                    <div>
                      <label className="block text-xs font-medium text-teal-100">Custodian</label>
                      <div className="text-sm font-bold text-zinc-100">
                        {record.custodianempname}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Employee #{record.custodianempno}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-teal-100">Department</label>
                      <div className="text-[12px] text-zinc-100">
                        {record.department}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-teal-100">Location</label>
                      <div className="text-[12px] text-zinc-100">
                        {record.location}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-teal-100">Rack Location</label>
                      <div className="text-[12px] text-zinc-100">
                        {record.racklocation}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-teal-100">Custody From</label>
                      <div className="text-[12px] text-zinc-100">
                        {new Date(record.custodyfrom).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-teal-100">Created By</label>
                      <div className="text-[12px] text-zinc-100">
                        {record.createdby}
                        <span className="text-[10px] text-zinc-400 ml-1">
                          on {new Date(record.createdate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {custodyRecords.length > 1 && (
            <button 
              onClick={toggleHistory}
              className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              {showHistory 
                ? "Hide Custody History"
                : `View Custody History (${custodyRecords.length - 1} previous records)`}
            </button>
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-300">
          No custody records found for this asset.
        </div>
      )}
    </div>
  );
} 