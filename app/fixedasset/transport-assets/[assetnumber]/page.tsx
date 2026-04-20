'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import CollapsibleSection from '@/app/components/CollapsibleSection';
import { AssetQRCode } from '@/components/AssetQRCode';

interface TransportDetail {
  _id: string;
  assetnumber: string;
  assetdescription: string;
  assetcategory: string;
  assetsubcategory: string;
  assetstatus: string;
  acquiredvalue: number | null;
  acquireddate?: string | Date | null;
  location: string;
  department: string;
  plateNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleModel?: string;
  modelYear?: number | null;
}

interface MasterRow {
  _id: string;
  name: string;
}

interface PreventiveRecord {
  _id: string;
  maintenanceTypeId: string;
  maintenanceTypeName: string;
  scheduledDate?: string | Date | null;
  actualDate?: string | Date | null;
  remarks?: string;
}

interface BreakdownRecord {
  _id: string;
  maintenanceTypeId: string;
  maintenanceTypeName: string;
  actualDate?: string | Date | null;
  remarks?: string;
}

function dIn(v: string | Date | null | undefined): string {
  if (v === null || v === undefined || v === '') return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function dOut(v: string | Date | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TransportAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetnumber = typeof params?.assetnumber === 'string' ? params.assetnumber : '';

  const [asset, setAsset] = useState<TransportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topSaving, setTopSaving] = useState(false);
  const [topForm, setTopForm] = useState({
    assetdescription: '',
    assetcategory: '',
    assetsubcategory: '',
    assetstatus: '',
    acquiredvalue: '',
    acquireddate: '',
    location: '',
    department: '',
    plateNumber: '',
    chassisNumber: '',
    engineNumber: '',
    vehicleModel: '',
    modelYear: ''
  });

  const [prevMasters, setPrevMasters] = useState<MasterRow[]>([]);
  const [brkMasters, setBrkMasters] = useState<MasterRow[]>([]);
  const [preventive, setPreventive] = useState<PreventiveRecord[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownRecord[]>([]);

  const [newPrev, setNewPrev] = useState({
    maintenanceTypeId: '',
    scheduledDate: '',
    actualDate: '',
    remarks: ''
  });
  const [newBrk, setNewBrk] = useState({
    maintenanceTypeId: '',
    actualDate: '',
    remarks: ''
  });

  const [editPrev, setEditPrev] = useState<PreventiveRecord | null>(null);
  const [editPrevForm, setEditPrevForm] = useState({
    maintenanceTypeId: '',
    scheduledDate: '',
    actualDate: '',
    remarks: ''
  });
  const [editBrk, setEditBrk] = useState<BreakdownRecord | null>(null);
  const [editBrkForm, setEditBrkForm] = useState({ maintenanceTypeId: '', actualDate: '', remarks: '' });

  const base = `/api/transportassets/${encodeURIComponent(assetnumber)}`;

  const loadAsset = useCallback(async () => {
    const res = await fetch(base);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to load asset');
    return (await res.json()) as TransportDetail;
  }, [base]);

  const loadLists = useCallback(async () => {
    const [p, b, pm, bm] = await Promise.all([
      fetch(`${base}/preventive-maintenance`),
      fetch(`${base}/breakdown-maintenance`),
      fetch('/api/transportassets/maintenance-types/preventive'),
      fetch('/api/transportassets/maintenance-types/breakdown')
    ]);
    if (!p.ok || !b.ok || !pm.ok || !bm.ok) throw new Error('Failed to load maintenance data');
    setPreventive(await p.json());
    setBreakdown(await b.json());
    setPrevMasters(await pm.json());
    setBrkMasters(await bm.json());
  }, [base]);

  const load = useCallback(async () => {
    if (!assetnumber) return;
    try {
      setLoading(true);
      setError(null);
      const a = await loadAsset();
      if (!a) {
        setError('Transport asset not found.');
        setAsset(null);
        return;
      }
      setAsset(a);
      setTopForm({
        assetdescription: a.assetdescription ?? '',
        assetcategory: a.assetcategory ?? '',
        assetsubcategory: a.assetsubcategory ?? '',
        assetstatus: a.assetstatus ?? '',
        acquiredvalue:
          a.acquiredvalue !== null && a.acquiredvalue !== undefined ? String(a.acquiredvalue) : '',
        acquireddate: dIn(a.acquireddate),
        location: a.location ?? '',
        department: a.department ?? '',
        plateNumber: a.plateNumber ?? '',
        chassisNumber: a.chassisNumber ?? '',
        engineNumber: a.engineNumber ?? '',
        vehicleModel: a.vehicleModel ?? '',
        modelYear: a.modelYear !== null && a.modelYear !== undefined ? String(a.modelYear) : ''
      });
      await loadLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setAsset(null);
    } finally {
      setLoading(false);
    }
  }, [assetnumber, loadAsset, loadLists]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTop = async () => {
    try {
      setTopSaving(true);
      const body: Record<string, unknown> = {
        assetdescription: topForm.assetdescription,
        assetcategory: topForm.assetcategory,
        assetsubcategory: topForm.assetsubcategory,
        assetstatus: topForm.assetstatus,
        location: topForm.location,
        department: topForm.department,
        plateNumber: topForm.plateNumber,
        chassisNumber: topForm.chassisNumber,
        engineNumber: topForm.engineNumber,
        vehicleModel: topForm.vehicleModel,
        modelYear: topForm.modelYear.trim() !== '' ? Number(topForm.modelYear) : null
      };
      if (topForm.acquiredvalue.trim() !== '') body.acquiredvalue = Number(topForm.acquiredvalue);
      else body.acquiredvalue = null;
      body.acquireddate = topForm.acquireddate || null;

      const res = await fetch(base, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Save failed');
      setAsset(json as TransportDetail);
      alert('Asset details saved.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setTopSaving(false);
    }
  };

  const addPreventive = async () => {
    if (!newPrev.maintenanceTypeId) {
      alert('Select a maintenance type.');
      return;
    }
    try {
      const res = await fetch(`${base}/preventive-maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceTypeId: newPrev.maintenanceTypeId,
          scheduledDate: newPrev.scheduledDate || null,
          actualDate: newPrev.actualDate || null,
          remarks: newPrev.remarks
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Failed to add');
      setNewPrev({ maintenanceTypeId: '', scheduledDate: '', actualDate: '', remarks: '' });
      await loadLists();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  const addBreakdown = async () => {
    if (!newBrk.maintenanceTypeId) {
      alert('Select a maintenance type.');
      return;
    }
    try {
      const res = await fetch(`${base}/breakdown-maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceTypeId: newBrk.maintenanceTypeId,
          actualDate: newBrk.actualDate || null,
          remarks: newBrk.remarks
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Failed to add');
      setNewBrk({ maintenanceTypeId: '', actualDate: '', remarks: '' });
      await loadLists();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  const deletePrev = async (id: string) => {
    if (!confirm('Delete this preventive maintenance record?')) return;
    try {
      const res = await fetch(`${base}/preventive-maintenance/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await loadLists();
    } catch {
      alert('Delete failed');
    }
  };

  const deleteBrk = async (id: string) => {
    if (!confirm('Delete this breakdown maintenance record?')) return;
    try {
      const res = await fetch(`${base}/breakdown-maintenance/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await loadLists();
    } catch {
      alert('Delete failed');
    }
  };

  const saveEditPrev = async () => {
    if (!editPrev) return;
    try {
      const res = await fetch(`${base}/preventive-maintenance/${encodeURIComponent(editPrev._id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceTypeId: editPrevForm.maintenanceTypeId,
          scheduledDate: editPrevForm.scheduledDate || null,
          actualDate: editPrevForm.actualDate || null,
          remarks: editPrevForm.remarks
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Update failed');
      setEditPrev(null);
      await loadLists();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const saveEditBrk = async () => {
    if (!editBrk) return;
    try {
      const res = await fetch(`${base}/breakdown-maintenance/${encodeURIComponent(editBrk._id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceTypeId: editBrkForm.maintenanceTypeId,
          actualDate: editBrkForm.actualDate || null,
          remarks: editBrkForm.remarks
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Update failed');
      setEditBrk(null);
      await loadLists();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const openEditPrev = (r: PreventiveRecord) => {
    setEditPrev(r);
    setEditPrevForm({
      maintenanceTypeId: String(r.maintenanceTypeId),
      scheduledDate: dIn(r.scheduledDate),
      actualDate: dIn(r.actualDate),
      remarks: r.remarks ?? ''
    });
  };

  const openEditBrk = (r: BreakdownRecord) => {
    setEditBrk(r);
    setEditBrkForm({
      maintenanceTypeId: String(r.maintenanceTypeId),
      actualDate: dIn(r.actualDate),
      remarks: r.remarks ?? ''
    });
  };

  const inp =
    'mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm placeholder-white/40';

  if (!assetnumber) {
    return <div className="min-h-screen bg-slate-900 p-6 text-white">Invalid asset.</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      <div className="relative z-20 flex flex-col min-h-screen p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/fixedasset/transport-assets')}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
          >
            ← Transport assets list
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-6 text-red-200">{error}</div>
        )}

        {!loading && asset && (
          <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-12">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-teal-300/90">Transport asset</p>
                  <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{asset.assetnumber}</h1>
                </div>
                <div className="shrink-0 rounded-xl border border-white/15 bg-black/20 p-3">
                  <p className="mb-2 text-xs text-white/50">QR code</p>
                  <AssetQRCode
                    assetNumber={asset.assetnumber}
                    assetDescription={asset.assetdescription}
                    assetType="transportasset"
                  />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-white/60">Description</dt>
                  <dd className="font-medium text-white">{asset.assetdescription || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Category / Subcategory</dt>
                  <dd className="font-medium text-white">
                    {[asset.assetcategory, asset.assetsubcategory].filter(Boolean).join(' · ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60">Status</dt>
                  <dd className="font-medium text-white">{asset.assetstatus || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Acquisition value</dt>
                  <dd className="font-medium text-white">
                    {typeof asset.acquiredvalue === 'number'
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(
                          asset.acquiredvalue
                        )
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60">Acquisition date</dt>
                  <dd className="font-medium text-white">{dOut(asset.acquireddate)}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Plate number</dt>
                  <dd className="font-medium text-white">{asset.plateNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Chassis number</dt>
                  <dd className="font-medium text-white">{asset.chassisNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Engine number</dt>
                  <dd className="font-medium text-white">{asset.engineNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Model</dt>
                  <dd className="font-medium text-white">{asset.vehicleModel || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Year</dt>
                  <dd className="font-medium text-white">
                    {asset.modelYear !== null && asset.modelYear !== undefined ? String(asset.modelYear) : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <CollapsibleSection title="Edit asset details" defaultExpanded>
              <div className="w-full max-w-4xl space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block sm:col-span-2 lg:col-span-3">
                    <span className="text-xs text-white/70">Description</span>
                    <input
                      className={inp}
                      value={topForm.assetdescription}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetdescription: e.target.value }))}
                    />
                  </label>
                  {(
                    [
                      ['assetcategory', 'Category'],
                      ['assetsubcategory', 'Subcategory'],
                      ['assetstatus', 'Status'],
                      ['location', 'Location'],
                      ['department', 'Department'],
                      ['plateNumber', 'Plate number'],
                      ['chassisNumber', 'Chassis number'],
                      ['engineNumber', 'Engine number'],
                      ['vehicleModel', 'Model']
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="block">
                      <span className="text-xs text-white/70">{label}</span>
                      <input
                        className={inp}
                        value={topForm[k]}
                        onChange={(e) => setTopForm((f) => ({ ...f, [k]: e.target.value }))}
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="text-xs text-white/70">Year</span>
                    <input
                      type="number"
                      className={inp}
                      value={topForm.modelYear}
                      onChange={(e) => setTopForm((f) => ({ ...f, modelYear: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Acquisition value</span>
                    <input
                      type="number"
                      step="any"
                      className={inp}
                      value={topForm.acquiredvalue}
                      onChange={(e) => setTopForm((f) => ({ ...f, acquiredvalue: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Acquisition date</span>
                    <input
                      type="date"
                      className={inp}
                      value={topForm.acquireddate}
                      onChange={(e) => setTopForm((f) => ({ ...f, acquireddate: e.target.value }))}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={saveTop}
                  disabled={topSaving}
                  className="rounded-xl bg-teal-500 px-5 py-2.5 font-medium text-white hover:bg-teal-600 disabled:opacity-50"
                >
                  {topSaving ? 'Saving…' : 'Save asset details'}
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Preventive maintenance" defaultExpanded>
              <div className="w-full max-w-5xl space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="text-sm text-white/70">
                  Scheduled vs actual dates for preventive work. Manage type labels under{' '}
                  <Link href="/fixedasset/transport-assets/masters/preventive" className="text-teal-400 underline">
                    Preventive types
                  </Link>
                  .
                </p>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-black/30 text-white/80">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Scheduled</th>
                        <th className="px-3 py-2">Actual</th>
                        <th className="px-3 py-2">Remarks</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {preventive.map((r) => (
                        <tr key={r._id} className="border-t border-white/10 text-white/90">
                          <td className="px-3 py-2">{r.maintenanceTypeName}</td>
                          <td className="px-3 py-2">{dOut(r.scheduledDate)}</td>
                          <td className="px-3 py-2">{dOut(r.actualDate)}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate">{r.remarks || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditPrev(r)}
                              className="mr-2 text-teal-400 hover:underline text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePrev(r._id)}
                              className="text-red-300 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-4">
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Type</span>
                    <select
                      className={inp}
                      value={newPrev.maintenanceTypeId}
                      onChange={(e) => setNewPrev((f) => ({ ...f, maintenanceTypeId: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {prevMasters.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Scheduled date</span>
                    <input
                      type="date"
                      className={inp}
                      value={newPrev.scheduledDate}
                      onChange={(e) => setNewPrev((f) => ({ ...f, scheduledDate: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Actual date</span>
                    <input
                      type="date"
                      className={inp}
                      value={newPrev.actualDate}
                      onChange={(e) => setNewPrev((f) => ({ ...f, actualDate: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2 lg:col-span-4">
                    <span className="text-xs text-white/70">Remarks</span>
                    <input
                      className={inp}
                      value={newPrev.remarks}
                      onChange={(e) => setNewPrev((f) => ({ ...f, remarks: e.target.value }))}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addPreventive}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-500"
                >
                  Add preventive record
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Breakdown maintenance" defaultExpanded>
              <div className="w-full max-w-5xl space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="text-sm text-white/70">
                  Actual repair / damage events. Manage types under{' '}
                  <Link href="/fixedasset/transport-assets/masters/breakdown" className="text-teal-400 underline">
                    Breakdown types
                  </Link>
                  .
                </p>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-black/30 text-white/80">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Actual date</th>
                        <th className="px-3 py-2">Remarks</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.map((r) => (
                        <tr key={r._id} className="border-t border-white/10 text-white/90">
                          <td className="px-3 py-2">{r.maintenanceTypeName}</td>
                          <td className="px-3 py-2">{dOut(r.actualDate)}</td>
                          <td className="px-3 py-2 max-w-[240px] truncate">{r.remarks || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditBrk(r)}
                              className="mr-2 text-teal-400 hover:underline text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBrk(r._id)}
                              className="text-red-300 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 border-t border-white/10 pt-4">
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Type</span>
                    <select
                      className={inp}
                      value={newBrk.maintenanceTypeId}
                      onChange={(e) => setNewBrk((f) => ({ ...f, maintenanceTypeId: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {brkMasters.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Actual date</span>
                    <input
                      type="date"
                      className={inp}
                      value={newBrk.actualDate}
                      onChange={(e) => setNewBrk((f) => ({ ...f, actualDate: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Remarks</span>
                    <input
                      className={inp}
                      value={newBrk.remarks}
                      onChange={(e) => setNewBrk((f) => ({ ...f, remarks: e.target.value }))}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addBreakdown}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-500"
                >
                  Add breakdown record
                </button>
              </div>
            </CollapsibleSection>

            <div className="text-center">
              <Link href="/fixedasset/transport-assets" className="text-sm text-teal-400 hover:text-teal-300">
                Back to list
              </Link>
            </div>
          </main>
        )}

        {editPrev && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-900 p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Edit preventive record</h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs text-white/70">Type</span>
                  <select
                    className={inp}
                    value={editPrevForm.maintenanceTypeId}
                    onChange={(e) => setEditPrevForm((f) => ({ ...f, maintenanceTypeId: e.target.value }))}
                  >
                    {prevMasters.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Scheduled date</span>
                  <input
                    type="date"
                    className={inp}
                    value={editPrevForm.scheduledDate}
                    onChange={(e) => setEditPrevForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Actual date</span>
                  <input
                    type="date"
                    className={inp}
                    value={editPrevForm.actualDate}
                    onChange={(e) => setEditPrevForm((f) => ({ ...f, actualDate: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Remarks</span>
                  <input
                    className={inp}
                    value={editPrevForm.remarks}
                    onChange={(e) => setEditPrevForm((f) => ({ ...f, remarks: e.target.value }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditPrev(null)} className="px-4 py-2 text-white/80">
                  Cancel
                </button>
                <button type="button" onClick={saveEditPrev} className="rounded-lg bg-teal-600 px-4 py-2">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {editBrk && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-900 p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Edit breakdown record</h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs text-white/70">Type</span>
                  <select
                    className={inp}
                    value={editBrkForm.maintenanceTypeId}
                    onChange={(e) => setEditBrkForm((f) => ({ ...f, maintenanceTypeId: e.target.value }))}
                  >
                    {brkMasters.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Actual date</span>
                  <input
                    type="date"
                    className={inp}
                    value={editBrkForm.actualDate}
                    onChange={(e) => setEditBrkForm((f) => ({ ...f, actualDate: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Remarks</span>
                  <input
                    className={inp}
                    value={editBrkForm.remarks}
                    onChange={(e) => setEditBrkForm((f) => ({ ...f, remarks: e.target.value }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditBrk(null)} className="px-4 py-2 text-white/80">
                  Cancel
                </button>
                <button type="button" onClick={saveEditBrk} className="rounded-lg bg-teal-600 px-4 py-2">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
