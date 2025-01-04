'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  category: string;
  name: string;
}

export default function CategoriesManagement() {
  const [activeTab, setActiveTab] = useState<'mme' | 'fixed'>('mme');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategory, setNewSubcategory] = useState({ category: '', name: '' });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      console.log('Fetched categories:', data); // Debug log
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error); // Debug log
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subcategories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      console.log('Fetched subcategories:', data); // Debug log
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error); // Debug log
      setError('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!response.ok) throw new Error('Failed to add category');
      fetchCategories();
      setNewCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error); // Add debug log
      setError('Failed to add category');
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to update category');
      fetchCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error); // Add debug log
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${activeTab}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  const handleAddSubcategory = async () => {
    try {
      const response = await fetch(`/api/subcategories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubcategory),
      });
      if (!response.ok) throw new Error('Failed to add subcategory');
      fetchSubcategories();
      setNewSubcategory({ category: '', name: '' });
    } catch (error) {
      console.error('Error adding subcategory:', error);
      setError('Failed to add subcategory');
    }
  };

  const handleUpdateSubcategory = async (subcategory: Subcategory) => {
    try {
      const response = await fetch(`/api/subcategories/${activeTab === 'mme' ? 'mme' : 'fixedasset'}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategory),
      });
      if (!response.ok) throw new Error('Failed to update subcategory');
      fetchSubcategories();
      setEditingSubcategory(null);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setError('Failed to update subcategory');
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      const response = await fetch(`/api/subcategories/${activeTab}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subcategory');
      fetchSubcategories();
    } catch (error) {
      setError('Failed to delete subcategory');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingSubcategory(prev => prev ? {
      _id: prev._id,
      category: e.target.value,
      name: prev.name
    } : null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">Categories Management</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('mme')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'mme' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-zinc-300'
            }`}
          >
            MME Categories
          </button>
          <button
            onClick={() => setActiveTab('fixed')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'fixed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-zinc-300'
            }`}
          >
            Fixed Asset Categories
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Categories</h2>
          
          {/* Add Category Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 bg-slate-700/50 text-zinc-100 rounded-md px-3 py-2"
            />
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Add Category
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between bg-slate-700/30 p-3 rounded-md"
              >
                {editingCategory?._id === category._id ? (
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="flex-1 bg-slate-600 text-zinc-100 rounded-md px-2 py-1 mr-2"
                  />
                ) : (
                  <span className="text-zinc-100">{category.name}</span>
                )}
                
                <div className="flex gap-2">
                  {editingCategory?._id === category._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateCategory(editingCategory)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories Section */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Subcategories</h2>
          
          {/* Add Subcategory Form */}
          <div className="flex gap-2 mb-4">
            <select
              value={newSubcategory.category}
              onChange={(e) => setNewSubcategory(prev => ({ ...prev, category: e.target.value }))}
              className="bg-slate-700/50 text-zinc-100 rounded-md px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSubcategory.name}
              onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="New subcategory name"
              className="flex-1 bg-slate-700/50 text-zinc-100 rounded-md px-3 py-2"
            />
            <button
              onClick={handleAddSubcategory}
              disabled={!newSubcategory.category || !newSubcategory.name}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-white px-4 py-2 rounded-md"
            >
              Add Subcategory
            </button>
          </div>

          {/* Subcategories List */}
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory._id}
                className="flex items-center justify-between bg-slate-700/30 p-3 rounded-md"
              >
                {editingSubcategory?._id === subcategory._id ? (
                  <div className="flex-1 flex gap-2 mr-2">
                    <select
                      value={editingSubcategory.category}
                      onChange={(e) => setEditingSubcategory(prev => prev ? {
                        _id: prev._id,
                        category: prev.category,
                        name: e.target.value
                      } : null)}
                      className="bg-slate-600 text-zinc-100 rounded-md px-2 py-1"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editingSubcategory.name}
                      onChange={(e) => setEditingSubcategory(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                      className="flex-1 bg-slate-600 text-zinc-100 rounded-md px-2 py-1"
                    />
                  </div>
                ) : (
                  <div className="text-zinc-100">
                    <span className="text-zinc-400">{subcategory.category}</span>
                    <span className="mx-2">→</span>
                    <span>{subcategory.name}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {editingSubcategory?._id === subcategory._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateSubcategory(editingSubcategory)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSubcategory(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingSubcategory(subcategory)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(subcategory._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 