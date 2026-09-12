'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import ThemedPageShell from '@/app/components/ThemedPageShell';
import { useThemeSurfaces } from '@/lib/themePageStyles';
import { fap, formatCurrency } from '@/lib/fixedAssetPageDesign';
import { dateToInputValue, type IncompleteHeaderAssetType } from '@/lib/incompleteAssetHeaders';

export type IncompleteHeaderRow = {
  assetnumber: string;
  headerExists: boolean;
  assetdescription: string | null;
  acquireddate: string | Date | null;
  acquiredvalue: number | null;
  assetcategory: string | null;
  assetsubcategory: string | null;
  assetstatus: string | null;
  hasCustody: boolean;
  hasCalibration: boolean;
  missingDescription: boolean;
  missingDate: boolean;
  missingValue: boolean;
};

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        on
          ? 'border border-amber-400/40 bg-amber-400/15 text-amber-700 dark:text-amber-200'
          : 'border border-slate-300/40 bg-slate-500/10 text-slate-500 dark:text-white/50'
      }`}
    >
      {label}
    </span>
  );
}

export default function IncompleteHeadersPage({
  assetType,
  title,
  subtitle,
  detailHref,
}: {
  assetType: IncompleteHeaderAssetType;
  title: string;
  subtitle: string;
  detailHref: (assetnumber: string) => string;
}) {
  const s = useThemeSurfaces();
  const [data, setData] = useState<IncompleteHeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<IncompleteHeaderRow | null>(null);
  const [clearing, setClearing] = useState<IncompleteHeaderRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/incomplete-headers?type=${assetType}`);
      if (!response.ok) throw new Error('Failed to load incomplete headers');
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load incomplete headers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [assetType]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (row) =>
        row.assetnumber.toLowerCase().includes(term) ||
        (row.assetdescription || '').toLowerCase().includes(term)
    );
  }, [data, search]);

  const saveFields = async (
    assetnumber: string,
    payload: { assetdescription: string; acquireddate: string; acquiredvalue: string },
    clear = false
  ) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/incomplete-headers/${encodeURIComponent(assetnumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          clear
            ? { type: assetType, clear: true }
            : {
                type: assetType,
                assetdescription: payload.assetdescription,
                acquireddate: payload.acquireddate,
                acquiredvalue: payload.acquiredvalue,
              }
        ),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Please sign in to add, edit, or clear these fields.');
      }
      if (!response.ok) {
        throw new Error(result.error || 'Save failed');
      }
      setEditing(null);
      setClearing(null);
      await fetchRows();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<IncompleteHeaderRow>[] = [
    {
      accessorKey: 'assetnumber',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Asset Number
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link
          href={detailHref(row.original.assetnumber)}
          target="_blank"
          rel="noopener noreferrer"
          className={s.link}
        >
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'assetdescription',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-[260px] truncate text-[12px]" title={row.original.assetdescription || ''}>
          {row.original.assetdescription || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'acquireddate',
      header: 'Acquisition date',
      cell: ({ row }) => <div className="text-[12px]">{formatDate(row.original.acquireddate)}</div>,
    },
    {
      accessorKey: 'acquiredvalue',
      header: 'Acquisition value',
      cell: ({ row }) => (
        <div className="text-[12px]">{formatCurrency(row.original.acquiredvalue ?? undefined)}</div>
      ),
    },
    {
      id: 'records',
      header: 'Linked records',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Flag on={row.original.hasCustody} label="Custody" />
          <Flag on={row.original.hasCalibration} label="Calibration" />
          <Flag on={!row.original.headerExists} label="No header" />
        </div>
      ),
    },
    {
      id: 'missing',
      header: 'Missing',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.missingDescription ? <Flag on label="Description" /> : null}
          {row.original.missingDate ? <Flag on label="Date" /> : null}
          {row.original.missingValue ? <Flag on label="Value" /> : null}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(row.original)}
            className={`${s.btnSecondary} !px-2 !py-1.5 text-xs`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {row.original.headerExists ? (
            <button
              type="button"
              onClick={() => setClearing(row.original)}
              className={fap.btnDanger}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <ThemedPageShell maxWidth="max-w-[1440px]">
      <div className="flex flex-col gap-6">
        <div className={`${s.card} ${s.cardPadding}`}>
          <h1 className={s.heroTitle}>{title}</h1>
          <p className={`mt-2 ${s.heroSubtitle}`}>{subtitle}</p>
        </div>

        <div className={`${s.card} p-6`}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="incomplete-search" className={s.label}>
                Search asset number or description
              </label>
              <input
                id="incomplete-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. 500224"
                className={s.searchInput}
              />
            </div>
            <button type="button" onClick={fetchRows} disabled={loading} className={s.btnPrimary}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className={s.tableWrap}>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className={s.spinner} />
            </div>
          ) : error ? (
            <div className={`m-4 ${s.errorBox}`}>{error}</div>
          ) : filtered.length === 0 ? (
            <div className={`py-8 text-center ${s.textMuted}`}>
              No incomplete headers match the current filters.
            </div>
          ) : (
            <>
              <div className={`border-b px-4 py-2 ${s.tableSummaryBorder}`}>
                <p className={`text-sm ${s.textSecondary}`}>
                  Showing {filtered.length} of {data.length} asset{filtered.length !== 1 ? 's' : ''} with custody
                  and/or calibration but incomplete header fields.
                </p>
              </div>
              <ResponsiveTanStackTable
                data={filtered}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                getRowId={(row) => row.assetnumber}
                variant={s.isLight ? 'light' : 'smarttags'}
              />
            </>
          )}
        </div>
      </div>

      {editing ? (
        <HeaderFieldsModal
          row={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={(payload) => saveFields(editing.assetnumber, payload)}
        />
      ) : null}

      {clearing ? (
        <div className={fap.modalOverlay}>
          <div className={`${fap.modal} max-w-md`}>
            <h2 className={s.pageTitle}>Clear mandatory fields</h2>
            <p className={`mt-2 text-sm ${s.textSecondary}`}>
              Remove description, acquisition date, and acquisition value from {clearing.assetnumber}? Custody and
              calibration records are not deleted.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className={s.btnSecondary} onClick={() => setClearing(null)} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className={fap.btnDanger}
                disabled={saving}
                onClick={() =>
                  saveFields(clearing.assetnumber, { assetdescription: '', acquireddate: '', acquiredvalue: '' }, true)
                }
              >
                {saving ? 'Clearing...' : 'Clear fields'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ThemedPageShell>
  );
}

function HeaderFieldsModal({
  row,
  saving,
  onClose,
  onSave,
}: {
  row: IncompleteHeaderRow;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { assetdescription: string; acquireddate: string; acquiredvalue: string }) => void;
}) {
  const s = useThemeSurfaces();
  const [assetdescription, setAssetdescription] = useState(row.assetdescription || '');
  const [acquireddate, setAcquireddate] = useState(dateToInputValue(row.acquireddate));
  const [acquiredvalue, setAcquiredvalue] = useState(
    row.acquiredvalue == null || Number.isNaN(Number(row.acquiredvalue)) ? '' : String(row.acquiredvalue)
  );

  return (
    <div className={fap.modalOverlay}>
      <div className={`${fap.modal} max-w-lg`}>
        <h2 className={s.pageTitle}>{row.headerExists ? 'Edit header fields' : 'Add header fields'}</h2>
        <p className={`mt-1 text-sm ${s.textSecondary}`}>
          Asset {row.assetnumber}
          {row.headerExists ? '' : ' — no header document yet; saving will create one.'}
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ assetdescription, acquireddate, acquiredvalue });
          }}
        >
          <div>
            <label htmlFor="assetdescription" className={s.label}>
              Asset description
            </label>
            <textarea
              id="assetdescription"
              value={assetdescription}
              onChange={(e) => setAssetdescription(e.target.value)}
              rows={3}
              className={s.input}
            />
          </div>
          <div>
            <label htmlFor="acquireddate" className={s.label}>
              Acquisition date
            </label>
            <input
              id="acquireddate"
              type="date"
              value={acquireddate}
              onChange={(e) => setAcquireddate(e.target.value)}
              className={s.input}
            />
          </div>
          <div>
            <label htmlFor="acquiredvalue" className={s.label}>
              Acquisition value
            </label>
            <input
              id="acquiredvalue"
              type="number"
              step="0.01"
              value={acquiredvalue}
              onChange={(e) => setAcquiredvalue(e.target.value)}
              className={s.input}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={s.btnSecondary} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={s.btnPrimary} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
