'use client';

import { useEffect, useState } from 'react';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import { fap } from '@/lib/fixedAssetPageDesign';

interface Row {
  _id: string;
  name: string;
}

type Props = {
  apiPath: '/api/transportassets/maintenance-types/preventive' | '/api/transportassets/maintenance-types/breakdown';
  title: string;
  description: string;
  placeholder: string;
};

export default function TransportMaintenanceTypesMaster({
  apiPath,
  title,
  description,
  placeholder,
}: Props) {
  const { theme } = useAppTheme();
  const isLight = theme === 'light';

  const [rows, setRows] = useState<Row[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = isLight ? 'min-h-screen bg-[#F1F5F9] p-6 text-[#0F172A]' : `${fap.page} p-6 text-[#F8F9FA]`;
  const card = isLight
    ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
    : `${fap.card} p-4`;
  const subtitle = isLight ? 'mt-1 text-sm text-slate-600' : 'mt-1 text-sm text-[#94A3B8]';
  const input = isLight
    ? 'flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20'
    : `flex-1 min-w-[200px] ${fap.input}`;
  const inputInline = isLight
    ? 'flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900'
    : 'flex-1 rounded border border-[#2A3B4C] bg-[#1E293B] px-2 py-1 text-sm text-[#F8F9FA]';
  const rowItem = isLight
    ? 'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
    : 'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2A3B4C]/50 bg-[#1E293B] px-3 py-2';
  const muted = isLight ? 'text-slate-500' : 'text-[#94A3B8]';
  const linkEdit = isLight ? 'text-sm text-cyan-700 hover:underline' : 'text-sm text-[#00B4D8] hover:underline';
  const linkDelete = isLight ? 'text-sm text-red-600 hover:underline' : 'text-sm text-[#EF4444] hover:underline';
  const linkCancel = isLight ? 'text-sm text-slate-500 hover:underline' : 'text-sm text-[#94A3B8] hover:underline';
  const errorBox = isLight
    ? 'rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700'
    : fap.errorBox;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(apiPath);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load types');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiPath]);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load types');
    } finally {
      setLoading(false);
    }
  };

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      setError(null);
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Failed to add');
      }
      setNewName('');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    }
  };

  const saveEdit = async () => {
    if (!editing?.name.trim()) return;
    try {
      setError(null);
      const res = await fetch(apiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editing._id, name: editing.name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Failed to update');
      }
      setEditing(null);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this maintenance type?')) return;
    try {
      setError(null);
      const res = await fetch(`${apiPath}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      reload();
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div className={page}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className={isLight ? 'text-2xl font-bold text-slate-900' : fap.sectionTitle}>{title}</h1>
          <p className={subtitle}>{description}</p>
        </div>

        {error && <div className={errorBox}>{error}</div>}

        <div className={card}>
          <h2 className={`mb-3 text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-[#F8F9FA]'}`}>Add type</h2>
          <div className="flex flex-wrap gap-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={placeholder} className={input} />
            <button type="button" onClick={add} className={fap.btnPrimary}>
              Add
            </button>
          </div>
        </div>

        <div className={card}>
          <h2 className={`mb-3 text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-[#F8F9FA]'}`}>Types</h2>
          {loading ? (
            <p className={muted}>Loading…</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r._id} className={rowItem}>
                  {editing?._id === r._id ? (
                    <>
                      <input
                        className={inputInline}
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      />
                      <button type="button" onClick={saveEdit} className={linkEdit}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className={linkCancel}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={isLight ? 'text-slate-800' : 'text-[#F8F9FA]'}>{r.name}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditing({ ...r })} className={linkEdit}>
                          Edit
                        </button>
                        <button type="button" onClick={() => del(r._id)} className={linkDelete}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
