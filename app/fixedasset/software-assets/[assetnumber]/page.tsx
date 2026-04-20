'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import CollapsibleSection from '@/app/components/CollapsibleSection';
import { AssetQRCode } from '@/components/AssetQRCode';

export type LicenseType = 'perpetual' | 'annual' | 'other_periodic' | '';

export interface SoftwareAssetDetail {
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
  deviceAssetNumber?: string;
  deviceSerialNumber?: string;
  deviceLocation?: string;
  licenseNumber?: string;
  licenseType?: LicenseType;
  licenseStartDate?: string | Date | null;
  licenseEndDate?: string | Date | null;
  licenseRemarks?: string;
}

function formatDateInput(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SoftwareAssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetnumber = typeof params?.assetnumber === 'string' ? params.assetnumber : '';

  const [asset, setAsset] = useState<SoftwareAssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topSaving, setTopSaving] = useState(false);
  const [licenseSaving, setLicenseSaving] = useState(false);

  const [topForm, setTopForm] = useState({
    assetdescription: '',
    assetcategory: '',
    assetsubcategory: '',
    assetstatus: '',
    acquiredvalue: '',
    acquireddate: '',
    location: '',
    department: ''
  });

  const [licenseForm, setLicenseForm] = useState({
    deviceAssetNumber: '',
    deviceSerialNumber: '',
    deviceLocation: '',
    licenseNumber: '',
    licenseType: '' as LicenseType,
    licenseStartDate: '',
    licenseEndDate: '',
    licenseRemarks: ''
  });

  const load = useCallback(async () => {
    if (!assetnumber) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/softwareassets/${encodeURIComponent(assetnumber)}`);
      if (res.status === 404) {
        setError('Software asset not found.');
        setAsset(null);
        return;
      }
      if (!res.ok) throw new Error('Failed to load software asset');
      const data: SoftwareAssetDetail = await res.json();
      setAsset(data);
      setTopForm({
        assetdescription: data.assetdescription ?? '',
        assetcategory: data.assetcategory ?? '',
        assetsubcategory: data.assetsubcategory ?? '',
        assetstatus: data.assetstatus ?? '',
        acquiredvalue:
          data.acquiredvalue !== null && data.acquiredvalue !== undefined
            ? String(data.acquiredvalue)
            : '',
        acquireddate: formatDateInput(data.acquireddate),
        location: data.location ?? '',
        department: data.department ?? ''
      });
      setLicenseForm({
        deviceAssetNumber: data.deviceAssetNumber ?? '',
        deviceSerialNumber: data.deviceSerialNumber ?? '',
        deviceLocation: data.deviceLocation ?? '',
        licenseNumber: data.licenseNumber ?? '',
        licenseType: (data.licenseType as LicenseType) ?? '',
        licenseStartDate: formatDateInput(data.licenseStartDate),
        licenseEndDate: formatDateInput(data.licenseEndDate),
        licenseRemarks: data.licenseRemarks ?? ''
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setAsset(null);
    } finally {
      setLoading(false);
    }
  }, [assetnumber]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTop = async () => {
    if (!assetnumber) return;
    try {
      setTopSaving(true);
      const body: Record<string, unknown> = {
        assetdescription: topForm.assetdescription,
        assetcategory: topForm.assetcategory,
        assetsubcategory: topForm.assetsubcategory,
        assetstatus: topForm.assetstatus,
        location: topForm.location,
        department: topForm.department
      };
      if (topForm.acquiredvalue.trim() !== '') {
        body.acquiredvalue = Number(topForm.acquiredvalue);
      } else {
        body.acquiredvalue = null;
      }
      body.acquireddate = topForm.acquireddate || null;

      const res = await fetch(`/api/softwareassets/${encodeURIComponent(assetnumber)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Save failed');
      setAsset(json as SoftwareAssetDetail);
      alert('Asset details saved.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setTopSaving(false);
    }
  };

  const saveLicense = async () => {
    if (!assetnumber) return;
    try {
      setLicenseSaving(true);
      const body: Record<string, unknown> = {
        deviceAssetNumber: licenseForm.deviceAssetNumber,
        deviceSerialNumber: licenseForm.deviceSerialNumber,
        deviceLocation: licenseForm.deviceLocation,
        licenseNumber: licenseForm.licenseNumber,
        licenseType: licenseForm.licenseType || '',
        licenseRemarks: licenseForm.licenseRemarks
      };
      body.licenseStartDate =
        licenseForm.licenseType === 'perpetual' ? null : licenseForm.licenseStartDate || null;
      body.licenseEndDate =
        licenseForm.licenseType === 'perpetual' ? null : licenseForm.licenseEndDate || null;

      const res = await fetch(`/api/softwareassets/${encodeURIComponent(assetnumber)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Save failed');
      setAsset(json as SoftwareAssetDetail);
      alert('Installation and license details saved.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLicenseSaving(false);
    }
  };

  if (!assetnumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332] p-6 text-white">
        Invalid asset.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      <div className="relative z-20 flex flex-col min-h-screen p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/fixedasset/software-assets')}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
          >
            ← Software assets list
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        )}

        {!loading && asset && (
          <main className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-teal-300/90">Software asset</p>
                  <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{asset.assetnumber}</h1>
                  <p className="mt-2 text-sm text-white/70">
                    Quick read-only summary — edit fields in the sections below.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-white/15 bg-black/20 p-3">
                  <p className="mb-2 text-xs text-white/50">QR code</p>
                  <AssetQRCode
                    assetNumber={asset.assetnumber}
                    assetDescription={asset.assetdescription}
                    assetType="softwareasset"
                  />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-white/60">Name / description</dt>
                  <dd className="font-medium text-white">{asset.assetdescription || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Category</dt>
                  <dd className="font-medium text-white">{asset.assetcategory || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Subcategory</dt>
                  <dd className="font-medium text-white">{asset.assetsubcategory || '—'}</dd>
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
                  <dd className="font-medium text-white">{formatDisplayDate(asset.acquireddate)}</dd>
                </div>
              </dl>
            </div>

            <CollapsibleSection title="Edit asset details" defaultExpanded>
              <div className="w-full max-w-3xl space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Name / description</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      value={topForm.assetdescription}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetdescription: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Category</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.assetcategory}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetcategory: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Subcategory</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.assetsubcategory}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetsubcategory: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Status</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.assetstatus}
                      onChange={(e) => setTopForm((f) => ({ ...f, assetstatus: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Acquisition value</span>
                    <input
                      type="number"
                      step="any"
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.acquiredvalue}
                      onChange={(e) => setTopForm((f) => ({ ...f, acquiredvalue: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Acquisition date</span>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.acquireddate}
                      onChange={(e) => setTopForm((f) => ({ ...f, acquireddate: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Location</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.location}
                      onChange={(e) => setTopForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Department</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={topForm.department}
                      onChange={(e) => setTopForm((f) => ({ ...f, department: e.target.value }))}
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

            <CollapsibleSection title="Installation device & license" defaultExpanded>
              <div className="w-full max-w-3xl space-y-4 rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="text-sm text-white/70">
                  Record where the software is installed and how it is licensed. Use device asset number and/or serial
                  as applicable.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs text-white/70">Device asset number</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={licenseForm.deviceAssetNumber}
                      onChange={(e) =>
                        setLicenseForm((f) => ({ ...f, deviceAssetNumber: e.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-white/70">Device serial number</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={licenseForm.deviceSerialNumber}
                      onChange={(e) =>
                        setLicenseForm((f) => ({ ...f, deviceSerialNumber: e.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Device location</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={licenseForm.deviceLocation}
                      onChange={(e) =>
                        setLicenseForm((f) => ({ ...f, deviceLocation: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">License number</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={licenseForm.licenseNumber}
                      onChange={(e) => setLicenseForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">License type</span>
                    <select
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                      value={licenseForm.licenseType}
                      onChange={(e) =>
                        setLicenseForm((f) => ({
                          ...f,
                          licenseType: e.target.value as LicenseType
                        }))
                      }
                    >
                      <option value="">Not specified</option>
                      <option value="perpetual">Perpetual</option>
                      <option value="annual">Annual</option>
                      <option value="other_periodic">Other periodic</option>
                    </select>
                  </label>
                  {licenseForm.licenseType !== 'perpetual' && licenseForm.licenseType !== '' && (
                    <>
                      <label className="block">
                        <span className="text-xs text-white/70">License start date</span>
                        <input
                          type="date"
                          className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                          value={licenseForm.licenseStartDate}
                          onChange={(e) =>
                            setLicenseForm((f) => ({ ...f, licenseStartDate: e.target.value }))
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-white/70">End / expiry date</span>
                        <input
                          type="date"
                          className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                          value={licenseForm.licenseEndDate}
                          onChange={(e) =>
                            setLicenseForm((f) => ({ ...f, licenseEndDate: e.target.value }))
                          }
                        />
                      </label>
                    </>
                  )}
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-white/70">Remarks</span>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40"
                      value={licenseForm.licenseRemarks}
                      onChange={(e) =>
                        setLicenseForm((f) => ({ ...f, licenseRemarks: e.target.value }))
                      }
                      placeholder="Notes, renewal contacts, etc."
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={saveLicense}
                  disabled={licenseSaving}
                  className="rounded-xl bg-teal-500 px-5 py-2.5 font-medium text-white hover:bg-teal-600 disabled:opacity-50"
                >
                  {licenseSaving ? 'Saving…' : 'Save installation & license'}
                </button>
              </div>
            </CollapsibleSection>

            <div className="pb-8 text-center">
              <Link
                href="/fixedasset/software-assets"
                className="text-sm text-teal-400 hover:text-teal-300"
              >
                Back to list
              </Link>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
