'use client';

import { useEffect, useState } from 'react';
import CollapsibleSection from '@/app/components/CollapsibleSection';
import type { Theme } from '@/app/components/AssetDetails';

type AssetType = 'portable' | 'software' | 'transport' | 'mme' | 'fixedasset';
type FieldType = 'text' | 'number' | 'date';

interface CustomDetailRecord {
  _id: string;
  assetType: AssetType;
  assetnumber: string;
  label: string;
  fieldType: FieldType;
  valueText?: string | null;
  valueNumber?: number | null;
  valueDate?: string | Date | null;
  createdby?: string;
  createdat?: string | Date;
  updatedby?: string;
  updatedat?: string | Date;
}

interface Props {
  assetType: AssetType;
  assetnumber: string;
  theme?: Theme;
}

function formatValue(record: CustomDetailRecord): string {
  if (record.fieldType === 'number') {
    return record.valueNumber !== null && record.valueNumber !== undefined
      ? String(record.valueNumber)
      : '—';
  }
  if (record.fieldType === 'date') {
    if (!record.valueDate) return '—';
    const d = new Date(record.valueDate);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }
  return record.valueText?.trim() ? record.valueText : '—';
}

function formatMetaDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function CustomDetailsSection({ assetType, assetnumber, theme = 'default' }: Props) {
  const [rows, setRows] = useState<CustomDetailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    fieldType: 'text' as FieldType,
    valueText: '',
    valueNumber: '',
    valueDate: '',
  });
  const [editField, setEditField] = useState({
    label: '',
    fieldType: 'text' as FieldType,
    valueText: '',
    valueNumber: '',
    valueDate: '',
  });

  const base = `/api/customdata/${encodeURIComponent(assetType)}/${encodeURIComponent(assetnumber)}`;
  const getContainerStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return 'bg-white/10 backdrop-blur-lg border border-white/20';
      case 'light':
        return 'bg-white border-2 border-blue-200';
      default:
        return 'bg-slate-800 border border-slate-600/60';
    }
  };

  const getTextStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          primary: 'text-white',
          secondary: 'text-white/75',
          muted: 'text-white/60',
          tableHead: 'bg-black/30 text-white/80',
          tableRow: 'border-white/10 text-white/90',
          input: 'border-white/20 bg-white/10 text-white placeholder-white/40',
          subtleBorder: 'border-white/10',
          buttonSecondary: 'border-white/20 text-white/80',
        };
      case 'light':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          muted: 'text-gray-500',
          tableHead: 'bg-blue-50 text-blue-900',
          tableRow: 'border-blue-100 text-gray-800',
          input: 'border-blue-300 bg-white text-gray-900 placeholder-gray-400',
          subtleBorder: 'border-blue-100',
          buttonSecondary: 'border-blue-300 text-gray-700',
        };
      default:
        return {
          primary: 'text-zinc-100',
          secondary: 'text-zinc-300',
          muted: 'text-zinc-400',
          tableHead: 'bg-black/30 text-white/80',
          tableRow: 'border-white/10 text-white/90',
          input: 'border-white/20 bg-white/10 text-white placeholder-white/40',
          subtleBorder: 'border-white/10',
          buttonSecondary: 'border-white/20 text-white/80',
        };
    }
  };

  const styles = getTextStyles();
  const inputClass = `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${styles.input}`;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(base);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || 'Failed to load custom details');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load custom details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!assetnumber) return;
    load();
  }, [assetnumber, assetType]);

  const addCustomDetail = async () => {
    if (!newField.label.trim()) {
      alert('Label is required.');
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        label: newField.label.trim(),
        fieldType: newField.fieldType,
      };

      if (newField.fieldType === 'number') {
        payload.valueNumber = newField.valueNumber.trim() === '' ? null : Number(newField.valueNumber);
      } else if (newField.fieldType === 'date') {
        payload.valueDate = newField.valueDate || null;
      } else {
        payload.valueText = newField.valueText.trim() || null;
      }

      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to add custom detail');

      setNewField({
        label: '',
        fieldType: 'text',
        valueText: '',
        valueNumber: '',
        valueDate: '',
      });
      setIsAdding(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add custom detail');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomDetail = async (id: string) => {
    if (!confirm('Delete this custom detail?')) return;
    try {
      const res = await fetch(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete custom detail');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete custom detail');
    }
  };

  const openEdit = (record: CustomDetailRecord) => {
    setEditingId(record._id);
    setEditField({
      label: record.label,
      fieldType: record.fieldType,
      valueText: record.valueText ?? '',
      valueNumber:
        record.valueNumber !== null && record.valueNumber !== undefined ? String(record.valueNumber) : '',
      valueDate:
        record.valueDate ? new Date(record.valueDate).toISOString().slice(0, 10) : '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editField.label.trim()) {
      alert('Label is required.');
      return;
    }
    try {
      setEditSaving(true);
      const payload: Record<string, unknown> = {
        label: editField.label.trim(),
        fieldType: editField.fieldType,
      };

      if (editField.fieldType === 'number') {
        payload.valueNumber = editField.valueNumber.trim() === '' ? null : Number(editField.valueNumber);
      } else if (editField.fieldType === 'date') {
        payload.valueDate = editField.valueDate || null;
      } else {
        payload.valueText = editField.valueText.trim() || null;
      }

      const res = await fetch(`${base}/${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update custom detail');

      setEditingId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update custom detail');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <CollapsibleSection title="Custom details" defaultExpanded theme={theme}>
      <div className={`w-full max-w-4xl space-y-4 rounded-xl p-6 ${getContainerStyles()}`}>
        <p className={`text-sm ${styles.secondary}`}>
          Add custom fields per asset. Choose field type, set a label, then enter a value.
        </p>

        {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

        {loading ? (
          <div className={`text-sm ${styles.secondary}`}>Loading custom details…</div>
        ) : (
          <div className={`overflow-x-auto rounded-lg border ${styles.subtleBorder}`}>
            <table className="min-w-full text-left text-sm">
              <thead className={styles.tableHead}>
                <tr>
                  <th className="px-3 py-2">Label</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Last updated</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className={`border-t ${styles.tableRow}`}>
                    <td className="px-3 py-2">
                      {editingId === r._id ? (
                        <input
                          className={`w-full rounded border px-2 py-1 text-xs ${styles.input}`}
                          value={editField.label}
                          onChange={(e) => setEditField((f) => ({ ...f, label: e.target.value }))}
                        />
                      ) : (
                        r.label
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {editingId === r._id ? (
                        <select
                          className={`w-full rounded border px-2 py-1 text-xs ${styles.input}`}
                          value={editField.fieldType}
                          onChange={(e) =>
                            setEditField((f) => ({
                              ...f,
                              fieldType: e.target.value as FieldType,
                              valueText: '',
                              valueNumber: '',
                              valueDate: '',
                            }))
                          }
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                      ) : (
                        r.fieldType
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === r._id ? (
                        <>
                          {editField.fieldType === 'text' && (
                            <input
                              className={`w-full rounded border px-2 py-1 text-xs ${styles.input}`}
                              value={editField.valueText}
                              onChange={(e) => setEditField((f) => ({ ...f, valueText: e.target.value }))}
                            />
                          )}
                          {editField.fieldType === 'number' && (
                            <input
                              type="number"
                              step="any"
                              className={`w-full rounded border px-2 py-1 text-xs ${styles.input}`}
                              value={editField.valueNumber}
                              onChange={(e) => setEditField((f) => ({ ...f, valueNumber: e.target.value }))}
                            />
                          )}
                          {editField.fieldType === 'date' && (
                            <input
                              type="date"
                              className={`w-full rounded border px-2 py-1 text-xs ${styles.input}`}
                              value={editField.valueDate}
                              onChange={(e) => setEditField((f) => ({ ...f, valueDate: e.target.value }))}
                            />
                          )}
                        </>
                      ) : (
                        formatValue(r)
                      )}
                    </td>
                    <td className={`px-3 py-2 text-xs ${styles.muted}`}>
                      {r.createdby || '—'}
                    </td>
                    <td className={`px-3 py-2 text-xs ${styles.muted}`}>
                      {(r.updatedby || '—') + ' / ' + formatMetaDate(r.updatedat)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {editingId === r._id ? (
                        <>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={editSaving}
                            className="mr-2 text-teal-300 hover:underline text-xs disabled:opacity-50"
                          >
                            {editSaving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={`mr-2 hover:underline text-xs ${styles.secondary}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="mr-2 text-teal-300 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomDetail(r._id)}
                            className="text-red-300 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`px-3 py-4 text-center ${styles.muted}`}>
                      No custom details yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-500 text-white"
          >
            + Add custom field
          </button>
        ) : (
          <div className={`grid gap-3 border-t pt-4 sm:grid-cols-2 ${styles.subtleBorder}`}>
            <label className="block">
              <span className={`text-xs ${styles.secondary}`}>Label</span>
              <input
                className={inputClass}
                value={newField.label}
                onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Fuel card number"
              />
            </label>
            <label className="block">
              <span className={`text-xs ${styles.secondary}`}>Input type</span>
              <select
                className={inputClass}
                value={newField.fieldType}
                onChange={(e) =>
                  setNewField((f) => ({
                    ...f,
                    fieldType: e.target.value as FieldType,
                    valueText: '',
                    valueNumber: '',
                    valueDate: '',
                  }))
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </label>

            {newField.fieldType === 'text' && (
              <label className="block sm:col-span-2">
                <span className={`text-xs ${styles.secondary}`}>Value</span>
                <input
                  className={inputClass}
                  value={newField.valueText}
                  onChange={(e) => setNewField((f) => ({ ...f, valueText: e.target.value }))}
                />
              </label>
            )}

            {newField.fieldType === 'number' && (
              <label className="block sm:col-span-2">
                <span className={`text-xs ${styles.secondary}`}>Value</span>
                <input
                  type="number"
                  step="any"
                  className={inputClass}
                  value={newField.valueNumber}
                  onChange={(e) => setNewField((f) => ({ ...f, valueNumber: e.target.value }))}
                />
              </label>
            )}

            {newField.fieldType === 'date' && (
              <label className="block sm:col-span-2">
                <span className={`text-xs ${styles.secondary}`}>Value</span>
                <input
                  type="date"
                  className={inputClass}
                  value={newField.valueDate}
                  onChange={(e) => setNewField((f) => ({ ...f, valueDate: e.target.value }))}
                />
              </label>
            )}

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={addCustomDetail}
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium hover:bg-teal-500 text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save custom field'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`rounded-lg border px-4 py-2 text-sm ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
