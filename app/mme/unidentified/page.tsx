'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, Edit, Trash2 } from 'lucide-react';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { UnidentifiedItem } from '@/types/asset';

export default function UnidentifiedMMEPage() {
  const [data, setData] = useState<UnidentifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UnidentifiedItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<UnidentifiedItem | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/unidentified-mme');
      if (!response.ok) throw new Error('Failed to fetch items');
      const items = await response.json();
      setData(items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (itemData: Partial<UnidentifiedItem>) => {
    try {
      const response = await fetch('/api/unidentified-mme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to create item');
      await fetchItems();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    }
  };

  const handleUpdate = async (id: string, itemData: Partial<UnidentifiedItem>) => {
    try {
      const response = await fetch(`/api/unidentified-mme/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to update item');
      await fetchItems();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/unidentified-mme/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const columns: ColumnDef<UnidentifiedItem>[] = [
    {
      accessorKey: 'assetdescription',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Asset Description
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('assetdescription') || 'N/A'}</div>,
    },
    {
      accessorKey: 'assetmanufacturer',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Manufacturer
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
    },
    {
      accessorKey: 'assetmodel',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Model
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
    },
    {
      accessorKey: 'assetserialnumber',
      header: 'Serial Number',
    },
    {
      accessorKey: 'possibleassetnumber',
      header: 'Possible Asset Number',
    },
    {
      accessorKey: 'assetcategory',
      header: 'Category',
    },
    {
      accessorKey: 'assetsubcategory',
      header: 'Subcategory',
    },
    {
      accessorKey: 'assetvalue',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Value
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const value = row.getValue('assetvalue') as number;
        return value ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value) : 'N/A';
      }
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'locationdate',
      header: 'Location Date',
      cell: ({ row }) => {
        const date = row.getValue('locationdate') as string;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
    {
      accessorKey: 'custodianname',
      header: 'Custodian',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingItem(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteItem(row.original)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-between">
        <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">
          Unidentified MME & LVA
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No unidentified items found. Click "Add New" to create one.
          </div>
        ) : (
          <ResponsiveTanStackTable
            data={data}
            columns={columns}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            getRowId={(row) => row._id || ''}
          />
        )}
      </div>

      {showAddModal && (
        <ItemFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingItem && (
        <ItemFormModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => handleUpdate(editingItem._id!, data)}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => handleDelete(deleteItem._id!)}
        />
      )}
    </div>
  );
}

// Form Modal Component
function ItemFormModal({
  item,
  onClose,
  onSubmit,
}: {
  item?: UnidentifiedItem;
  onClose: () => void;
  onSubmit: (data: Partial<UnidentifiedItem>) => void;
}) {
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [subcategories, setSubcategories] = useState<Array<{ _id: string; category: string; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [formData, setFormData] = useState({
    assetdescription: item?.assetdescription || '',
    assetmodel: item?.assetmodel || '',
    assetmanufacturer: item?.assetmanufacturer || '',
    assetserialnumber: item?.assetserialnumber || '',
    possibleassetnumber: item?.possibleassetnumber || '',
    assetvalue: item?.assetvalue || undefined,
    assettype: item?.assettype || '',
    assetcategory: item?.assetcategory || '',
    assetsubcategory: item?.assetsubcategory || '',
    location: item?.location || '',
    locationdate: item?.locationdate ? new Date(item.locationdate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    custodianuser: item?.custodianuser || '',
    custodianname: item?.custodianname || '',
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/categories/mme');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes or when item is loaded
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.assetcategory || formData.assetcategory === '') {
        setSubcategories([]);
        if (!item?.assetsubcategory) {
          setFormData(prev => ({ ...prev, assetsubcategory: '' }));
        }
        return;
      }

      setLoadingSubcategories(true);
      try {
        const response = await fetch(`/api/subcategories/mme?category=${encodeURIComponent(formData.assetcategory)}`);
        if (!response.ok) throw new Error('Failed to fetch subcategories');
        const data = await response.json();
        setSubcategories(data);
        // Reset subcategory if current one doesn't belong to new category
        if (formData.assetsubcategory && !data.find((s: { name: string }) => s.name === formData.assetsubcategory)) {
          setFormData(prev => ({ ...prev, assetsubcategory: '' }));
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    fetchSubcategories();
  }, [formData.assetcategory, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetmodel || !formData.assetmanufacturer || !formData.assetserialnumber) {
      alert('Model, Manufacturer, and Serial Number are required');
      return;
    }
    // Convert form data to match API expectations
    const submitData: Partial<UnidentifiedItem> = {
      ...formData,
      locationdate: formData.locationdate ? formData.locationdate : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {item ? 'Edit Unidentified MME' : 'Add Unidentified MME'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asset Description/Name
              </label>
              <input
                type="text"
                value={formData.assetdescription}
                onChange={(e) => setFormData({ ...formData, assetdescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter asset description or name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                required
                value={formData.assetmanufacturer}
                onChange={(e) => setFormData({ ...formData, assetmanufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                required
                value={formData.assetmodel}
                onChange={(e) => setFormData({ ...formData, assetmodel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                required
                value={formData.assetserialnumber}
                onChange={(e) => setFormData({ ...formData, assetserialnumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Possible Asset Number
              </label>
              <input
                type="text"
                value={formData.possibleassetnumber}
                onChange={(e) => setFormData({ ...formData, possibleassetnumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value (Estimated)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.assetvalue || ''}
                onChange={(e) => setFormData({ ...formData, assetvalue: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type (Estimated)
              </label>
              <input
                type="text"
                value={formData.assettype}
                onChange={(e) => setFormData({ ...formData, assettype: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category (Estimated)
              </label>
              <select
                value={formData.assetcategory}
                onChange={(e) => setFormData({ ...formData, assetcategory: e.target.value, assetsubcategory: '' })}
                disabled={loadingCategories}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category...</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory (Estimated)
              </label>
              <select
                value={formData.assetsubcategory}
                onChange={(e) => setFormData({ ...formData, assetsubcategory: e.target.value })}
                disabled={loadingSubcategories || !formData.assetcategory || subcategories.length === 0}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Subcategory...</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory._id} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Date
              </label>
              <input
                type="date"
                value={formData.locationdate}
                onChange={(e) => setFormData({ ...formData, locationdate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custodian User
              </label>
              <input
                type="text"
                value={formData.custodianuser}
                onChange={(e) => setFormData({ ...formData, custodianuser: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custodian Name
              </label>
              <input
                type="text"
                value={formData.custodianname}
                onChange={(e) => setFormData({ ...formData, custodianname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  item,
  onClose,
  onConfirm,
}: {
  item: UnidentifiedItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Confirm Delete
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this item?
          <br />
          <strong>Manufacturer:</strong> {item.assetmanufacturer}
          <br />
          <strong>Model:</strong> {item.assetmodel}
          <br />
          <strong>Serial Number:</strong> {item.assetserialnumber}
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

