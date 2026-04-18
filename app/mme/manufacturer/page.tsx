'use client';

import { useEffect, useState } from 'react';

interface Manufacturer {
  _id: string;
  name: string;
}

export default function MMEManufacturerPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/manufacturers/mme');
      if (!response.ok) throw new Error('Failed to fetch manufacturers');
      const data = await response.json();
      setManufacturers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const handleAddManufacturer = async () => {
    const name = newManufacturerName.trim();
    if (!name) return;
    try {
      setError(null);
      const response = await fetch('/api/manufacturers/mme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('Failed to add manufacturer');
      setNewManufacturerName('');
      fetchManufacturers();
    } catch (err) {
      setError('Failed to add manufacturer');
    }
  };

  const handleUpdateManufacturer = async () => {
    if (!editingManufacturer || !editingManufacturer.name.trim()) return;
    try {
      setError(null);
      const response = await fetch('/api/manufacturers/mme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingManufacturer._id,
          name: editingManufacturer.name.trim()
        })
      });
      if (!response.ok) throw new Error('Failed to update manufacturer');
      setEditingManufacturer(null);
      fetchManufacturers();
    } catch (err) {
      setError('Failed to update manufacturer');
    }
  };

  const handleDeleteManufacturer = async (id: string) => {
    if (!confirm('Delete this manufacturer?')) return;
    try {
      setError(null);
      const response = await fetch(`/api/manufacturers/mme?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete manufacturer');
      fetchManufacturers();
    } catch (err) {
      setError('Failed to delete manufacturer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">MME Manufacturer Management</h1>

        {error && (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold">Add Manufacturer</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newManufacturerName}
              onChange={(e) => setNewManufacturerName(e.target.value)}
              placeholder="Manufacturer name"
              className="flex-1 rounded-md border border-slate-600 bg-slate-900 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddManufacturer}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold">View / Edit Manufacturers</h2>
          {loading ? (
            <p className="text-sm text-slate-300">Loading manufacturers...</p>
          ) : manufacturers.length === 0 ? (
            <p className="text-sm text-slate-300">No manufacturers found.</p>
          ) : (
            <div className="space-y-2">
              {manufacturers.map((manufacturer) => (
                <div
                  key={manufacturer._id}
                  className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 p-3"
                >
                  {editingManufacturer?._id === manufacturer._id ? (
                    <input
                      type="text"
                      value={editingManufacturer.name}
                      onChange={(e) =>
                        setEditingManufacturer((prev) => (prev ? { ...prev, name: e.target.value } : null))
                      }
                      className="mr-3 flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2"
                    />
                  ) : (
                    <span>{manufacturer.name}</span>
                  )}

                  <div className="flex gap-2">
                    {editingManufacturer?._id === manufacturer._id ? (
                      <>
                        <button
                          type="button"
                          onClick={handleUpdateManufacturer}
                          className="rounded-md bg-emerald-600 px-3 py-1 text-sm hover:bg-emerald-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingManufacturer(null)}
                          className="rounded-md bg-slate-600 px-3 py-1 text-sm hover:bg-slate-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingManufacturer(manufacturer)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteManufacturer(manufacturer._id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-sm hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
