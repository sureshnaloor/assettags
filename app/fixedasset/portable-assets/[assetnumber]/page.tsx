'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import CollapsibleSection from '@/app/components/CollapsibleSection';
import { AssetQRCode } from '@/components/AssetQRCode';
import CustomDetailsSection from '@/app/components/CustomDetailsSection';

type PortableTypeValue = '' | 'pre_engineered' | 'container_20' | 'container_40' | 'prefabricated_sheet';

const PORTABLE_LABELS: Record<string, string> = {
  '': '—',
  pre_engineered: 'Pre engineered',
  container_20: "Container 20'",
  container_40: "Container 40'",
  prefabricated_sheet: 'Prefabricated sheet type'
};

interface PortableDetail {
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
  portableType?: string;
  installationLocation?: string;
}

interface Modification {
  _id: string;
  entryKind: 'material' | 'service';
  category: string;
  description: string;
  remarks?: string;
  workDate?: string | Date | null;
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

export default function PortableAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetnumber = typeof params?.assetnumber === 'string' ? params.assetnumber : '';

  const [asset, setAsset] = useState<PortableDetail | null>(null);
  const [mods, setMods] = useState<Modification[]>([]);
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
    portableType: '' as PortableTypeValue,
    installationLocation: ''
  });

  const [newMod, setNewMod] = useState({
    entryKind: 'service' as 'material' | 'service',
    category: '',
    description: '',
    workDate: '',
    remarks: ''
  });

  const [editMod, setEditMod] = useState<Modification | null>(null);
  const [editModForm, setEditModForm] = useState({
    entryKind: 'service' as 'material' | 'service',
    category: '',
    description: '',
    workDate: '',
    remarks: ''
  });

  const base = `/api/portableassets/${encodeURIComponent(assetnumber)}`;

  const load = useCallback(async () => {
    if (!assetnumber) return;
    try {
      setLoading(true);
      setError(null);
      const [ar, mr] = await Promise.all([
        fetch(base),
        fetch(`${base}/modifications`)
      ]);
      if (ar.status === 404) {
        setError('Portable asset not found.');
        setAsset(null);
        return;
      }
      if (!ar.ok) throw new Error('Failed to load asset');
      if (!mr.ok) throw new Error('Failed to load modifications');
      const a = (await ar.json()) as PortableDetail;
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
        portableType: (a.portableType as PortableTypeValue) ?? '',
        installationLocation: a.installationLocation ?? ''
      });
      setMods(await mr.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setAsset(null);
    } finally {
      setLoading(false);
    }
  }, [assetnumber, base]);

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
        portableType: topForm.portableType || '',
        installationLocation: topForm.installationLocation
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
      setAsset(json as PortableDetail);
      alert('Asset details saved.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setTopSaving(false);
    }
  };

  const addMod = async () => {
    if (!newMod.category.trim() || !newMod.description.trim()) {
      alert('Category and description are required.');
      return;
    }
    try {
      const res = await fetch(`${base}/modifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryKind: newMod.entryKind,
          category: newMod.category.trim(),
          description: newMod.description.trim(),
          remarks: newMod.remarks,
          workDate: newMod.workDate || null
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Failed to add');
      setNewMod({ entryKind: 'service', category: '', description: '', workDate: '', remarks: '' });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  const deleteMod = async (id: string) => {
    if (!confirm('Delete this modification record?')) return;
    try {
      const res = await fetch(`${base}/modifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const openEditMod = (m: Modification) => {
    setEditMod(m);
    setEditModForm({
      entryKind: m.entryKind,
      category: m.category,
      description: m.description,
      workDate: dIn(m.workDate),
      remarks: m.remarks ?? ''
    });
  };

  const saveEditMod = async () => {
    if (!editMod) return;
    try {
      const res = await fetch(`${base}/modifications/${encodeURIComponent(editMod._id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryKind: editModForm.entryKind,
          category: editModForm.category.trim(),
          description: editModForm.description.trim(),
          remarks: editModForm.remarks,
          workDate: editModForm.workDate || null
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || 'Update failed');
      setEditMod(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const inp =
    'mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm placeholder-white/40';

  if (!assetnumber) {
    return <div className="min-h-screen bg-slate-900 p-6 text-white">Invalid asset.</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      <div className="relative z-20 flex flex-col min-h-screen p-4 md:p-6">
        <button
          type="button"
          onClick={() => router.push('/fixedasset/portable-assets')}
          className="mb-4 text-left text-teal-400 hover:text-teal-300 text-sm font-medium"
        >
          ← Portable assets list
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-6 text-red-200">{error}</div>
        )}

        {!loading && asset && (
          <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-12">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-teal-300/90">Portable asset</p>
                  <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{asset.assetnumber}</h1>
                </div>
                <div className="shrink-0 rounded-xl border border-white/15 bg-black/20 p-3">
                  <p className="mb-2 text-xs text-white/50">QR code</p>
                  <AssetQRCode
                    assetNumber={asset.assetnumber}
                    assetDescription={asset.assetdescription}
                    assetType="portableasset"
                  />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
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
                  <dt className="text-white/60">Portable type</dt>
                  <dd className="font-medium text-white">
                    {PORTABLE_LABELS[asset.portableType ?? ''] ?? asset.portableType ?? '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-white/60">Installation location</dt>
                  <dd className="font-medium text-white">{asset.installationLocation || '—'}</dd>
                </div>
              </dl>
            </div>

            <CollapsibleSection title="Edit asset details" defaultExpanded>
              <div className="w-full space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Description</span>
                    <input
                      className={inp}
                      value={topForm.assetdescription}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetdescription: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Category</span>
                    <input className={inp} value={topForm.assetcategory} onChange={(e) => setTopForm((f) => ({ ...f, assetcategory: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Subcategory</span>
                    <input
                      className={inp}
                      value={topForm.assetsubcategory}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetsubcategory: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Status</span>
                    <input className={inp} value={topForm.assetstatus} onChange={(e) => setTopForm((f) => ({ ...f, assetstatus: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Location</span>
                    <input className={inp} value={topForm.location} onChange={(e) => setTopForm((f) => ({ ...f, location: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Department</span>
                    <input className={inp} value={topForm.department} onChange={(e) => setTopForm((f) => ({ ...f, department: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Portable type</span>
                    <select
                      className={inp}
                      value={topForm.portableType}
                      onChange={(e) => setTopForm((f) => ({ ...f, portableType: e.target.value as PortableTypeValue }))}
                    >
                      <option value="">Not set</option>
                      <option value="pre_engineered">Pre engineered</option>
                      <option value="container_20">Container 20&apos;</option>
                      <option value="container_40">Container 40&apos;</option>
                      <option value="prefabricated_sheet">Prefabricated sheet type</option>
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Installation location</span>
                    <input
                      className={inp}
                      value={topForm.installationLocation}
                      onChange={(e) => setTopForm((f) => ({ ...f, installationLocation: e.target.value }))}
                      placeholder="Site / plot / building reference"
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
                  {topSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Modifications (materials & services)" defaultExpanded>
              <div className="w-full space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="text-sm text-white/70">
                  Record materials and services added to the portable unit (e.g. painting, insulation, HVAC, fire
                  systems, plumbing, toilet fit-out).
                </p>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-black/30 text-white/80">
                      <tr>
                        <th className="px-3 py-2">Kind</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2">Work date</th>
                        <th className="px-3 py-2">Remarks</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {mods.map((m) => (
                        <tr key={m._id} className="border-t border-white/10 text-white/90">
                          <td className="px-3 py-2 capitalize">{m.entryKind}</td>
                          <td className="px-3 py-2">{m.category}</td>
                          <td className="px-3 py-2 max-w-[200px]">{m.description}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{dOut(m.workDate)}</td>
                          <td className="px-3 py-2 max-w-[140px] truncate">{m.remarks || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditMod(m)}
                              className="mr-2 text-teal-400 hover:underline text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMod(m._id)}
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
                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs text-white/70">Material or service</span>
                    <select
                      className={inp}
                      value={newMod.entryKind}
                      onChange={(e) =>
                        setNewMod((f) => ({ ...f, entryKind: e.target.value as 'material' | 'service' }))
                      }
                    >
                      <option value="material">Material</option>
                      <option value="service">Service</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Category</span>
                    <input
                      className={inp}
                      value={newMod.category}
                      onChange={(e) => setNewMod((f) => ({ ...f, category: e.target.value }))}
                      placeholder="e.g. HVAC, painting, plumbing"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Description</span>
                    <input
                      className={inp}
                      value={newMod.description}
                      onChange={(e) => setNewMod((f) => ({ ...f, description: e.target.value }))}
                      placeholder="What was supplied or done"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Work date (optional)</span>
                    <input
                      type="date"
                      className={inp}
                      value={newMod.workDate}
                      onChange={(e) => setNewMod((f) => ({ ...f, workDate: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Remarks</span>
                    <input
                      className={inp}
                      value={newMod.remarks}
                      onChange={(e) => setNewMod((f) => ({ ...f, remarks: e.target.value }))}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addMod}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-500"
                >
                  Add modification
                </button>
              </div>
            </CollapsibleSection>

            <CustomDetailsSection assetType="portable" assetnumber={assetnumber} />

            <div className="text-center">
              <Link href="/fixedasset/portable-assets" className="text-sm text-teal-400 hover:text-teal-300">
                Back to list
              </Link>
            </div>
          </main>
        )}

        {editMod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-900 p-6 text-white">
              <h3 className="mb-4 text-lg font-semibold">Edit modification</h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs text-white/70">Kind</span>
                  <select
                    className={inp}
                    value={editModForm.entryKind}
                    onChange={(e) =>
                      setEditModForm((f) => ({ ...f, entryKind: e.target.value as 'material' | 'service' }))
                    }
                  >
                    <option value="material">Material</option>
                    <option value="service">Service</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Category</span>
                  <input
                    className={inp}
                    value={editModForm.category}
                    onChange={(e) => setEditModForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Description</span>
                  <input
                    className={inp}
                    value={editModForm.description}
                    onChange={(e) => setEditModForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Work date</span>
                  <input
                    type="date"
                    className={inp}
                    value={editModForm.workDate}
                    onChange={(e) => setEditModForm((f) => ({ ...f, workDate: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-white/70">Remarks</span>
                  <input
                    className={inp}
                    value={editModForm.remarks}
                    onChange={(e) => setEditModForm((f) => ({ ...f, remarks: e.target.value }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditMod(null)} className="px-4 py-2 text-white/80">
                  Cancel
                </button>
                <button type="button" onClick={saveEditMod} className="rounded-lg bg-teal-600 px-4 py-2">
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
