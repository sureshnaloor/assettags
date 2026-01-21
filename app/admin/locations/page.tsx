'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAppTheme } from '@/app/contexts/ThemeContext';

interface Location {
  _id: string;
  locationName: string;
  townCity: string;
  buildingTower: string;
  roomFloorNumber: string;
  palletRackBin?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LocationsManagement() {
  const { theme } = useAppTheme();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    locationName: '',
    townCity: '',
    buildingTower: '',
    roomFloorNumber: '',
    palletRackBin: '',
    remarks: '',
  });

  const getThemeStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          bg: 'bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]',
          card: 'bg-white/10 backdrop-blur-lg border border-white/20',
          input: 'bg-white/10 border border-white/20 text-white placeholder-white/50',
          button: 'bg-teal-500 hover:bg-teal-600 text-white',
          buttonSecondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
          text: 'text-white',
          textMuted: 'text-white/60',
          tableRow: 'border-white/10 hover:bg-white/5',
        };
      case 'light':
        return {
          bg: 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100',
          card: 'bg-white border-2 border-blue-200 shadow-md',
          input: 'bg-white border-2 border-blue-200 text-gray-900 placeholder-gray-500',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-blue-200',
          text: 'text-gray-900',
          textMuted: 'text-gray-600',
          tableRow: 'border-blue-200 hover:bg-blue-50',
        };
      default: // dark
        return {
          bg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
          card: 'bg-slate-800/50 border border-slate-700',
          input: 'bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400',
          button: 'bg-teal-600 hover:bg-teal-700 text-white',
          buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
          text: 'text-slate-100',
          textMuted: 'text-slate-400',
          tableRow: 'border-slate-700 hover:bg-slate-700/50',
        };
    }
  };

  const styles = getThemeStyles();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!formData.locationName.trim() || !formData.townCity.trim() || !formData.buildingTower.trim() || !formData.roomFloorNumber.trim()) {
        setError('Location name, town/city, building/tower, and room/floor number are required');
        return;
      }

      const method = editingLocation ? 'PUT' : 'POST';
      const body = editingLocation
        ? {
            ...formData,
            _id: editingLocation._id,
          }
        : formData;

      const response = await fetch('/api/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save location');
      }

      setSuccess(editingLocation ? 'Location updated successfully' : 'Location created successfully');
      fetchLocations();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete location');

      setSuccess('Location deleted successfully');
      fetchLocations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      locationName: location.locationName || '',
      townCity: location.townCity || '',
      buildingTower: location.buildingTower || '',
      roomFloorNumber: location.roomFloorNumber || '',
      palletRackBin: location.palletRackBin || '',
      remarks: location.remarks || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      locationName: '',
      townCity: '',
      buildingTower: '',
      roomFloorNumber: '',
      palletRackBin: '',
      remarks: '',
    });
    setEditingLocation(null);
    setShowForm(false);
  };

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${styles.text} mb-2`}>Locations Management</h1>
            <p className={styles.textMuted}>Add, edit, and delete locations</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={`${styles.button} flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200`}
            >
              <PlusIcon className="h-5 w-5" />
              New Location
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-red-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5" />
              {success}
            </span>
            <button onClick={() => setSuccess(null)} className="text-green-200 hover:text-green-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className={`${styles.card} p-6 rounded-lg mb-8`}>
            <h2 className={`${styles.text} text-2xl font-bold mb-6`}>
              {editingLocation ? 'Edit Location' : 'Create New Location'}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter location name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Town/City *
                </label>
                <input
                  type="text"
                  value={formData.townCity}
                  onChange={(e) => setFormData({ ...formData, townCity: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter town or city"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Building/Tower *
                </label>
                <input
                  type="text"
                  value={formData.buildingTower}
                  onChange={(e) => setFormData({ ...formData, buildingTower: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter building or tower name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Room Number / Floor Number *
                </label>
                <input
                  type="text"
                  value={formData.roomFloorNumber}
                  onChange={(e) => setFormData({ ...formData, roomFloorNumber: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter room number or floor number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Pallet/Rack/Bin (if available)
                </label>
                <input
                  type="text"
                  value={formData.palletRackBin}
                  onChange={(e) => setFormData({ ...formData, palletRackBin: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter pallet, rack, or bin number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
                  placeholder="Enter any additional remarks"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`${styles.button} px-6 py-2.5 rounded-lg font-medium transition-all duration-200`}
                >
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${styles.buttonSecondary} px-6 py-2.5 rounded-lg font-medium transition-all duration-200`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className={`${styles.card} rounded-lg overflow-hidden`}>
          {loading ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>Loading locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>No locations found. Create your first location!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${styles.tableRow} border-b`}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Location Name
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Town/City
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Building/Tower
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Room/Floor
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Pallet/Rack/Bin
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Remarks
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${styles.text}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location._id} className={`${styles.tableRow} border-b transition-colors duration-150`}>
                      <td className={`px-6 py-4 ${styles.text} font-medium`}>
                        {location.locationName || '-'}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm`}>
                        {location.townCity || '-'}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm`}>
                        {location.buildingTower || '-'}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm`}>
                        {location.roomFloorNumber || '-'}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm`}>
                        {location.palletRackBin || '-'}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm max-w-xs truncate`}>
                        {location.remarks || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(location)}
                            className={`${styles.buttonSecondary} p-2 rounded-lg transition-all duration-200 hover:scale-110`}
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(location._id, location.locationName || 'Unknown')}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
