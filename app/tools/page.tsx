'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { ToolData } from '@/types/tools';
import AssetQRCode from '@/components/AssetQRCode';

export default function ToolsPage() {
  const [data, setData] = useState<ToolData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolData | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (toolData: Partial<ToolData>) => {
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });

      if (!response.ok) throw new Error('Failed to add tool');
      
      await fetchTools();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const handleEditTool = async (toolId: string, toolData: Partial<ToolData>) => {
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });

      if (!response.ok) throw new Error('Failed to update tool');
      
      await fetchTools();
      setEditingTool(null);
    } catch (error) {
      console.error('Error updating tool:', error);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tool');
      
      await fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  const columns: ColumnDef<ToolData>[] = [
    {
      accessorKey: 'assetnumber',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tool ID
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link 
          href={`/tools/${row.original.assetnumber}`}
          className="text-blue-400 hover:text-blue-300"
        >
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'toolDescription',
      header: 'Description',
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('toolDescription')}</div>,
    },
    {
      accessorKey: 'serialNumber',
      header: 'Serial Number',
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
    },
    {
      accessorKey: 'modelNumber',
      header: 'Model',
    },
    {
      accessorKey: 'toolCost',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cost
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const value = row.getValue('toolCost');
        return typeof value === 'number' ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value) : 'N/A';
      }
    },
    {
      accessorKey: 'purchasedDate',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Purchase Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('purchasedDate') as string;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
    {
      accessorKey: 'toolStatus',
      header: 'Status',
    },
    {
      accessorKey: 'toolLocation',
      header: 'Location',
    },
    {
      header: 'QR Code',
      cell: ({ row }) => (
        <AssetQRCode 
          assetNumber={row.original.assetnumber} 
          assetDescription={row.original.toolDescription}
          assetType="Tool" 
        />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingTool(row.original)}
            className="text-blue-400 hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTool(row.original.assetnumber)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tools Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tool
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search tools..."
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ResponsiveTanStackTable
          data={data}
          columns={columns}
          sorting={sorting}
          setSorting={setSorting}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          getRowId={(row) => row._id || row.assetnumber}
        />
      </div>

      {/* Add Tool Form Modal */}
      {showAddForm && (
        <AddToolForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddTool}
        />
      )}

      {/* Edit Tool Form Modal */}
      {editingTool && (
        <EditToolForm
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSubmit={(toolData) => handleEditTool(editingTool.assetnumber, toolData)}
        />
      )}
    </div>
  );
}

// Add Tool Form Component
function AddToolForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Partial<ToolData>) => void }) {
  const [formData, setFormData] = useState<Partial<ToolData>>({
    toolDescription: '',
    serialNumber: '',
    manufacturer: '',
    modelNumber: '',
    toolCost: 0,
    purchasedDate: new Date(),
    purchasePONumber: '',
    purchaseSupplier: '',
    toolCategory: '',
    toolSubcategory: '',
    toolStatus: 'Available',
    toolLocation: 'Warehouse',
    toolCondition: 'Good',
    toolNotes: '',
    accessories: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Tool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Description *
              </label>
              <input
                type="text"
                required
                value={formData.toolDescription}
                onChange={(e) => setFormData({ ...formData, toolDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.toolCost}
                onChange={(e) => setFormData({ ...formData, toolCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchasedDate ? (formData.purchasedDate instanceof Date ? formData.purchasedDate.toISOString().split('T')[0] : formData.purchasedDate) : ''}
                onChange={(e) => setFormData({ ...formData, purchasedDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase PO Number
              </label>
              <input
                type="text"
                value={formData.purchasePONumber}
                onChange={(e) => setFormData({ ...formData, purchasePONumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Supplier
              </label>
              <input
                type="text"
                value={formData.purchaseSupplier}
                onChange={(e) => setFormData({ ...formData, purchaseSupplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Status
              </label>
              <select
                value={formData.toolStatus}
                onChange={(e) => setFormData({ ...formData, toolStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Location
              </label>
              <select
                value={formData.toolLocation}
                onChange={(e) => setFormData({ ...formData, toolLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Project Site">Project Site</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Condition
              </label>
              <select
                value={formData.toolCondition}
                onChange={(e) => setFormData({ ...formData, toolCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Accessories
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.toolNotes}
                onChange={(e) => setFormData({ ...formData, toolNotes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Tool Form Component
function EditToolForm({ tool, onClose, onSubmit }: { tool: ToolData; onClose: () => void; onSubmit: (data: Partial<ToolData>) => void }) {
  const [formData, setFormData] = useState<Partial<ToolData>>(tool);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Tool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool ID
              </label>
              <input
                type="text"
                value={formData.assetnumber}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Description *
              </label>
              <input
                type="text"
                required
                value={formData.toolDescription}
                onChange={(e) => setFormData({ ...formData, toolDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.toolCost}
                onChange={(e) => setFormData({ ...formData, toolCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchasedDate ? new Date(formData.purchasedDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, purchasedDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase PO Number
              </label>
              <input
                type="text"
                value={formData.purchasePONumber}
                onChange={(e) => setFormData({ ...formData, purchasePONumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Supplier
              </label>
              <input
                type="text"
                value={formData.purchaseSupplier}
                onChange={(e) => setFormData({ ...formData, purchaseSupplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Status
              </label>
              <select
                value={formData.toolStatus}
                onChange={(e) => setFormData({ ...formData, toolStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Location
              </label>
              <select
                value={formData.toolLocation}
                onChange={(e) => setFormData({ ...formData, toolLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Project Site">Project Site</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Condition
              </label>
              <select
                value={formData.toolCondition}
                onChange={(e) => setFormData({ ...formData, toolCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Accessories
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.toolNotes}
                onChange={(e) => setFormData({ ...formData, toolNotes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
