'use client';

import { useState, useEffect } from 'react';
import ThemedPageShell from '@/app/components/ThemedPageShell';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import { NonEmployeeUser } from '@/types/custody';

export default function NonEmployeeUsersPage() {
  const { theme } = useAppTheme();
  const isLight = theme === 'light';

  const [users, setUsers] = useState<NonEmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<NonEmployeeUser>({
    visitorNumber: '',
    name: '',
    userType: 'rental',
    nationalId: '',
    passportNumber: '',
    companySerialNumber: '',
    active: true,
  });

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/non-employee-users?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data.records || []);
      } else {
        setError(data.error || 'Failed to fetch non-employee users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching non-employee users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);
  }, [search]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      visitorNumber: '',
      name: '',
      userType: 'rental',
      nationalId: '',
      passportNumber: '',
      companySerialNumber: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: NonEmployeeUser) => {
    setIsEditing(true);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      if (!formData.visitorNumber.trim() || !formData.name.trim()) {
        setError('Visitor Number and Name are required');
        return;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/non-employee-users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(isEditing ? 'User updated successfully!' : 'User created successfully!');
        setIsModalOpen(false);
        fetchUsers(search);
      } else {
        setError(data.error || 'Failed to save non-employee user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedPageShell className="p-4 md:p-8" maxWidth="max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Non-Employee User Master
            </h1>
            <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Manage rental employees, visitors, contractors, and non-employee custody users.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl font-medium bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>+ Add Non-Employee User</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by visitor number, name, national ID, passport, or serial no..."
            className={`w-full text-sm rounded-xl p-3 border transition-colors ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-400'
            }`}
          />
        </div>

        {/* Users Table */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800 backdrop-blur-xl'
          }`}
        >
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading non-employee users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No non-employee users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr
                    className={`border-b text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800/50 text-slate-400 border-slate-800'
                    }`}
                  >
                    <th className="px-4 py-3">Visitor No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">National ID</th>
                    <th className="px-4 py-3">Passport No</th>
                    <th className="px-4 py-3">Company Serial No</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr
                      key={user.visitorNumber}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {user.visitorNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium">{user.name}</td>
                      <td className="px-4 py-3.5 capitalize">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {user.userType || 'Visitor'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {user.nationalId || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {user.passportNumber || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {user.companySerialNumber || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <h2 className="text-xl font-bold">
              {isEditing ? 'Edit Non-Employee User' : 'Add Non-Employee User'}
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Visitor / ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isEditing}
                  value={formData.visitorNumber}
                  onChange={(e) => setFormData({ ...formData, visitorNumber: e.target.value })}
                  placeholder="e.g. V-1001, RET-502, or National ID"
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name..."
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">User Category / Type</label>
                <select
                  value={formData.userType || 'rental'}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="rental">Rental Employee</option>
                  <option value="visitor">Visitor</option>
                  <option value="contractor">Contractor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">National ID Number</label>
                <input
                  type="text"
                  value={formData.nationalId || ''}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  placeholder="Optional national ID..."
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber || ''}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  placeholder="Optional passport number..."
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Company Serial Number / Gate Pass</label>
                <input
                  type="text"
                  value={formData.companySerialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, companySerialNumber: e.target.value })}
                  placeholder="Optional company assigned serial..."
                  className={`w-full rounded-xl p-2.5 border text-sm ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-medium bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm"
              >
                {saving ? 'Saving...' : 'Save User'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm border ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemedPageShell>
  );
}
