'use client';

import { useEffect, useState } from 'react';

interface Row {
  _id: string;
  name: string;
}

export default function TransportPreventiveMasterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/transportassets/maintenance-types/preventive');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      setError(null);
      const res = await fetch('/api/transportassets/maintenance-types/preventive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Failed to add');
      }
      setNewName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    }
  };

  const saveEdit = async () => {
    if (!editing?.name.trim()) return;
    try {
      setError(null);
      const res = await fetch('/api/transportassets/maintenance-types/preventive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editing._id, name: editing.name.trim() })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Failed to update');
      }
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this maintenance type?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/transportassets/maintenance-types/preventive?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      load();
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332] p-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Preventive maintenance types</h1>
          <p className="mt-1 text-sm text-white/70">
            Master list for scheduled / preventive work (oil change, tires, etc.). Used when logging maintenance on
            transport assets.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        <div className="rounded-xl border border-white/15 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold">Add type</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Oil change"
              className="flex-1 min-w-[200px] rounded-lg border border-white/20 bg-white/10 px-3 py-2"
            />
            <button
              type="button"
              onClick={add}
              className="rounded-lg bg-teal-600 px-4 py-2 font-medium hover:bg-teal-500"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold">Types</h2>
          {loading ? (
            <p className="text-white/60">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  {editing?._id === r._id ? (
                    <>
                      <input
                        className="flex-1 rounded border border-white/20 bg-white/10 px-2 py-1"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      />
                      <button type="button" onClick={saveEdit} className="text-teal-400 hover:underline text-sm">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="text-white/60 hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{r.name}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing({ ...r })}
                          className="text-sm text-teal-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => del(r._id)}
                          className="text-sm text-red-300 hover:underline"
                        >
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
