'use client';
import { useEffect, useMemo, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppTheme } from '@/app/contexts/ThemeContext';

interface CalibrationCompany {
  _id: string;
  code?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

const emptyForm = () => ({
  code: '',
  name: '',
  address: '',
  city: '',
  country: '',
});

export default function CalibrationCompaniesManagement() {
  const { theme } = useAppTheme();
  const [companies, setCompanies] = useState<CalibrationCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<CalibrationCompany | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyForm);

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
      default:
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

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/calibration-companies');
      if (!response.ok) throw new Error('Failed to fetch calibration companies');
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching calibration companies:', err);
      setError('Failed to load calibration companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingCompany(null);
    setShowForm(false);
  };

  const handleEdit = (company: CalibrationCompany) => {
    setEditingCompany(company);
    setFormData({
      code: company.code || '',
      name: company.name || '',
      address: company.address || '',
      city: company.city || '',
      country: company.country || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!formData.name.trim()) {
        setError('Company name is required');
        return;
      }

      const method = editingCompany ? 'PUT' : 'POST';
      const body = editingCompany
        ? { _id: editingCompany._id, ...formData }
        : formData;

      const response = await fetch('/api/calibration-companies', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save calibration company');
      }

      setSuccess(editingCompany ? 'Calibration company updated.' : 'Calibration company created.');
      resetForm();
      fetchCompanies();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save calibration company');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete calibration company "${name}"? This removes it from the Calibrated By dropdown.`)) {
      return;
    }
    try {
      setError(null);
      const response = await fetch(`/api/calibration-companies?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete calibration company');
      }
      setSuccess('Calibration company deleted.');
      fetchCompanies();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete calibration company');
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) =>
      [company.code, company.name, company.address, company.city, company.country]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [companies, searchQuery]);

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${styles.text} mb-2`}>Calibration Companies</h1>
            <p className={styles.textMuted}>
              Master list used by the Calibrated By dropdown on MME calibration records.
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setEditingCompany(null);
                setFormData(emptyForm());
                setShowForm(true);
              }}
              className={`${styles.button} flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200`}
            >
              <PlusIcon className="h-5 w-5" />
              New company
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-200 hover:text-red-100">
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
            <button type="button" onClick={() => setSuccess(null)} className="text-green-200 hover:text-green-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {showForm && (
          <div className={`${styles.card} p-6 rounded-lg mb-8`}>
            <h2 className={`${styles.text} text-2xl font-bold mb-6`}>
              {editingCompany ? 'Edit company' : 'Create new company'}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${styles.text} mb-2`}>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g. GCC LABS COMPANY"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.text} mb-2`}>Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Leave blank to auto-assign (CALIB-001)"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.text} mb-2`}>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Street / building"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.text} mb-2`}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="City"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${styles.text} mb-2`}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className={`${styles.button} px-6 py-2.5 rounded-lg font-medium transition-all duration-200`}
                >
                  {editingCompany ? 'Save changes' : 'Create company'}
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

        {!showForm && !loading && companies.length > 0 && (
          <div className={`${styles.card} p-4 rounded-lg mb-6`}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${styles.textMuted}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${styles.input} pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Search by name, code, city, country..."
              />
            </div>
            {searchQuery && (
              <p className={`mt-2 text-sm ${styles.textMuted}`}>
                {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
              </p>
            )}
          </div>
        )}

        <div className={`${styles.card} rounded-lg overflow-hidden`}>
          {loading ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>Loading calibration companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>No calibration companies yet. Add the first one to populate Calibrated By.</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>No companies match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${styles.tableRow} border-b`}>
                    <th className={`px-4 py-3 text-left font-semibold ${styles.text}`}>Code</th>
                    <th className={`px-4 py-3 text-left font-semibold ${styles.text}`}>Name</th>
                    <th className={`px-4 py-3 text-left font-semibold ${styles.text}`}>City</th>
                    <th className={`px-4 py-3 text-left font-semibold ${styles.text}`}>Country</th>
                    <th className={`px-4 py-3 text-left font-semibold ${styles.text}`}>Address</th>
                    <th className={`px-4 py-3 text-right font-semibold ${styles.text}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company._id} className={`${styles.tableRow} border-b transition-colors duration-150`}>
                      <td className={`px-4 py-3 ${styles.textMuted}`}>{company.code || '—'}</td>
                      <td className={`px-4 py-3 ${styles.text} font-medium`}>{company.name}</td>
                      <td className={`px-4 py-3 ${styles.textMuted}`}>{company.city || '—'}</td>
                      <td className={`px-4 py-3 ${styles.textMuted}`}>{company.country || '—'}</td>
                      <td className={`px-4 py-3 ${styles.textMuted}`}>{company.address || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(company)}
                            className={`${styles.buttonSecondary} p-2 rounded-lg transition-all duration-200 hover:scale-110`}
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(company._id, company.name)}
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
