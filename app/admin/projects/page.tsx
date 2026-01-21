'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppTheme } from '@/app/contexts/ThemeContext';

interface Project {
  _id: string;
  projectname: string;
  wbs: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsManagement() {
  const { theme } = useAppTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    projectname: '',
    wbs: '',
    status: 'active',
    description: '',
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
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!formData.projectname.trim() || !formData.wbs.trim()) {
        setError('Project name and WBS are required');
        return;
      }

      const method = editingProject ? 'PUT' : 'POST';
      const body = editingProject
        ? { ...formData, _id: editingProject._id }
        : formData;

      const response = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      setSuccess(editingProject ? 'Project updated successfully' : 'Project created successfully');
      fetchProjects();
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
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setSuccess('Project deleted successfully');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectname: project.projectname,
      wbs: project.wbs,
      status: project.status,
      description: project.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      projectname: '',
      wbs: '',
      status: 'active',
      description: '',
    });
    setEditingProject(null);
    setShowForm(false);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (project.projectname && project.projectname.toLowerCase().includes(query)) ||
      (project.wbs && project.wbs.toLowerCase().includes(query)) ||
      (project.status && project.status.toLowerCase().includes(query)) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className={`min-h-screen ${styles.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${styles.text} mb-2`}>Projects Management</h1>
            <p className={styles.textMuted}>Add, edit, and delete projects</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={`${styles.button} flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200`}
            >
              <PlusIcon className="h-5 w-5" />
              New Project
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
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectname}
                  onChange={(e) => setFormData({ ...formData, projectname: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  WBS (Work Breakdown Structure) *
                </label>
                <input
                  type="text"
                  value={formData.wbs}
                  onChange={(e) => setFormData({ ...formData, wbs: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="Enter WBS code"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${styles.text} mb-2`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full ${styles.input} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`${styles.button} px-6 py-2.5 rounded-lg font-medium transition-all duration-200`}
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
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

        {/* Search Box */}
        {!showForm && !loading && projects.length > 0 && (
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
                placeholder="Search projects by name, WBS, status, or description..."
              />
            </div>
            {searchQuery && (
              <p className={`mt-2 text-sm ${styles.textMuted}`}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className={`${styles.card} rounded-lg overflow-hidden`}>
          {loading ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>No projects found. Create your first project!</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={`p-8 text-center ${styles.textMuted}`}>
              <p>No projects match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${styles.tableRow} border-b`}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Project Name
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      WBS
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${styles.text}`}>
                      Description
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${styles.text}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className={`${styles.tableRow} border-b transition-colors duration-150`}>
                      <td className={`px-6 py-4 ${styles.text} font-medium`}>
                        {project.projectname}
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted}`}>
                        {project.wbs}
                      </td>
                      <td className={`px-6 py-4`}>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            project.status === 'active'
                              ? 'bg-green-500/20 text-green-200'
                              : project.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-200'
                              : project.status === 'inactive'
                              ? 'bg-gray-500/20 text-gray-200'
                              : 'bg-yellow-500/20 text-yellow-200'
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${styles.textMuted} text-sm max-w-xs truncate`}>
                        {project.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className={`${styles.buttonSecondary} p-2 rounded-lg transition-all duration-200 hover:scale-110`}
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id, project.projectname)}
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
