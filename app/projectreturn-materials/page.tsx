'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, Edit, Trash2, Upload, Download, Package, Send, ClipboardList, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { ProjectReturnMaterialData } from '@/types/projectreturnmaterials';
import AssetQRCode from '@/components/AssetQRCode';
import ProjectReturnMaterialRequestForm from '@/components/ProjectReturnMaterialRequestForm';
import ProjectReturnMaterialIssueForm from '@/components/ProjectReturnMaterialIssueForm';

export default function ProjectReturnMaterialsPage() {
  const [data, setData] = useState<ProjectReturnMaterialData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProjectReturnMaterialData | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ProjectReturnMaterialData | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [materialToDispose, setMaterialToDispose] = useState<ProjectReturnMaterialData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/projectreturn-materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique warehouse locations for filter dropdown
  const uniqueLocations = Array.from(new Set(data.map(material => material.warehouseLocation).filter(Boolean)));

  // Filter data based on location filter
  const filteredData = locationFilter === 'all' 
    ? data 
    : data.filter(material => material.warehouseLocation === locationFilter);

  const handleAddMaterial = async (materialData: Partial<ProjectReturnMaterialData>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectreturn-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error('Failed to add material');
      
      await fetchMaterials();
      setShowAddForm(false);
      alert('Material added successfully');
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMaterial = async (materialData: Partial<ProjectReturnMaterialData>) => {
    if (!editingMaterial) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projectreturn-materials/${editingMaterial.materialid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error('Failed to update material');
      
      await fetchMaterials();
      setEditingMaterial(null);
      alert('Material updated successfully');
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Failed to update material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`/api/projectreturn-materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');
      
      await fetchMaterials();
      alert('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    }
  };

  const handleRequestMaterial = (material: ProjectReturnMaterialData) => {
    setSelectedMaterial(material);
    setShowRequestForm(true);
  };

  const handleIssueMaterial = (material: ProjectReturnMaterialData) => {
    setSelectedMaterial(material);
    setShowIssueForm(true);
  };

  const handleSubmitRequest = async (requestData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectreturn-materials/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      await fetchMaterials();
      setShowRequestForm(false);
      alert('Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitIssue = async (issueData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectreturn-materials/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) throw new Error('Failed to issue material');
      
      await fetchMaterials();
      setShowIssueForm(false);
      alert('Material issued successfully');
    } catch (error) {
      console.error('Error issuing material:', error);
      alert('Failed to issue material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisposeMaterial = (material: ProjectReturnMaterialData) => {
    setMaterialToDispose(material);
    setShowDisposeModal(true);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/projectreturn-materials/template');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project_return_materials_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleImportCSV = async (file: File) => {
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/projectreturn-materials/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to import materials';
        
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage += `\n\nErrors:\n${errorData.errors.slice(0, 20).join('\n')}`;
          if (errorData.errors.length > 20) {
            errorMessage += `\n... and ${errorData.errors.length - 20} more errors`;
          }
        }
        
        if (errorData.debug) {
          errorMessage += `\n\nDebug Info:\nHeaders found: ${errorData.debug.headersFound?.join(', ') || 'None'}\nTotal rows: ${errorData.debug.totalRows || 0}`;
        }
        
        alert(errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      if (result.errors && result.errors.length > 0) {
        alert(`Import completed with ${result.imported} materials. Errors: ${result.errors.join(', ')}`);
      } else {
        alert(`Successfully imported ${result.imported} materials`);
      }
      
      await fetchMaterials();
      setShowImportForm(false);
    } catch (error: any) {
      console.error('Error importing materials:', error);
      if (!error.message || !error.message.includes('Failed to import materials')) {
        // Error already shown in alert above
      } else {
        alert('Failed to import materials');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmDispose = async () => {
    if (!materialToDispose) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projectreturn-materials/${materialToDispose.materialid}/dispose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to dispose material');
      
      await fetchMaterials();
      setShowDisposeModal(false);
      setMaterialToDispose(null);
      alert('Material disposed successfully and moved to scrap');
    } catch (error) {
      console.error('Error disposing material:', error);
      alert('Failed to dispose material');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<ProjectReturnMaterialData>[] = [
    {
      accessorKey: 'materialid',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Material ID
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => (
        <Link 
          href={`/projectreturn-materials/${row.getValue('materialid')}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {row.getValue('materialid')}
        </Link>
      ),
    },
    {
      accessorKey: 'materialCode',
      header: 'Material Info',
      cell: ({ row }) => {
        const materialCode = row.getValue('materialCode') as string;
        const materialDescription = row.original.materialDescription;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {materialCode}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate" title={materialDescription}>
              {materialDescription}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'uom',
      header: 'UOM',
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Info',
      cell: ({ row }) => {
        const quantity = row.getValue('quantity') as number;
        const pendingRequests = row.original.pendingRequests;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              Qty: {quantity.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                pendingRequests > 0 
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
              }`}>
                Pending: {pendingRequests.toLocaleString()}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'sourceProject',
      header: 'Source Info',
      cell: ({ row }) => {
        const sourceProject = row.getValue('sourceProject') as string;
        const sourcePONumber = row.original.sourcePONumber;
        const sourceIssueNumber = row.original.sourceIssueNumber;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {sourceProject}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-0.5">
              {sourcePONumber && <div>PO: {sourcePONumber}</div>}
              {sourceIssueNumber && <div>Issue: {sourceIssueNumber}</div>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'sourceUnitRate',
      header: 'Unit Rate',
      cell: ({ row }) => {
        const value = row.getValue('sourceUnitRate') as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value);
      }
    },
    {
      accessorKey: 'warehouseLocation',
      header: 'Location Info',
      cell: ({ row }) => {
        const warehouseLocation = row.getValue('warehouseLocation') as string;
        const yardRoomRackBin = row.original.yardRoomRackBin;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm max-w-xs truncate" title={warehouseLocation}>
              {warehouseLocation}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate" title={yardRoomRackBin}>
              {yardRoomRackBin}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'receivedInWarehouseDate',
      header: 'Receipt Info',
      cell: ({ row }) => {
        const receivedDate = row.getValue('receivedInWarehouseDate') as Date;
        const consignmentNote = row.original.consignmentNoteNumber;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {receivedDate ? new Date(receivedDate).toLocaleDateString() : 'Not received'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              {consignmentNote ? `Note: ${consignmentNote}` : 'No note'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'QR Code',
      cell: ({ row }) => (
        <AssetQRCode 
          assetNumber={row.original.materialid} 
          assetDescription={row.original.materialDescription}
          assetType="Project Return Material" 
        />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRequestMaterial(row.original)}
            className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
            title="Request Material"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleIssueMaterial(row.original)}
            className="p-1 text-green-400 hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Issue Material"
          >
            <Package className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditingMaterial(row.original)}
            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Edit Material"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDisposeMaterial(row.original)}
            className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
            title="Dispose Material"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMaterial(row.original.materialid)}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete Material"
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
      <div className="mb-6">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Project Return Materials Management
          </h1>
        </div>
        
        {/* Action Icons */}
        <div className="flex flex-nowrap gap-6 sm:gap-8 w-1/3">
          <Link
            href="/projectreturn-materials/requests"
            className="flex flex-col items-center gap-1 group"
            title="Requests Pending"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 text-center whitespace-nowrap">
              Requests Pending
            </span>
          </Link>
          <Link
            href="/disposed-materials"
            className="flex flex-col items-center gap-1 group"
            title="Disposed Materials"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 text-center whitespace-nowrap">
              Disposed Materials
            </span>
          </Link>
          <button
            onClick={() => setShowImportForm(true)}
            className="flex flex-col items-center gap-1 group"
            title="Import CSV"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 text-center whitespace-nowrap">
              Import CSV
            </span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex flex-col items-center gap-1 group"
            title="Add Material"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 text-center whitespace-nowrap">
              Add Material
            </span>
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        {/* Location Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Warehouse Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations ({data.length})</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location} ({data.filter(m => m.warehouseLocation === location).length})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Materials
            </label>
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search materials..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <ResponsiveTanStackTable
          data={filteredData}
          columns={columns}
          sorting={sorting}
          setSorting={setSorting}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      {/* Add Material Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Project Return Material</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const materialData = {
                materialCode: formData.get('materialCode') as string,
                materialDescription: formData.get('materialDescription') as string,
                uom: formData.get('uom') as string,
                quantity: parseFloat(formData.get('quantity') as string) || 0,
                sourceProject: formData.get('sourceProject') as string,
                sourcePONumber: formData.get('sourcePONumber') as string,
                sourceIssueNumber: formData.get('sourceIssueNumber') as string,
                sourceUnitRate: parseFloat(formData.get('sourceUnitRate') as string) || 0,
                warehouseLocation: formData.get('warehouseLocation') as string,
                yardRoomRackBin: formData.get('yardRoomRackBin') as string,
                receivedInWarehouseDate: formData.get('receivedInWarehouseDate') ? new Date(formData.get('receivedInWarehouseDate') as string) : undefined,
                consignmentNoteNumber: formData.get('consignmentNoteNumber') as string,
                remarks: formData.get('remarks') as string,
              };
              handleAddMaterial(materialData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Material Code *
                  </label>
                  <input
                    type="text"
                    name="materialCode"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    UOM *
                  </label>
                  <input
                    type="text"
                    name="uom"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Material Description *
                  </label>
                  <input
                    type="text"
                    name="materialDescription"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source Project *
                  </label>
                  <input
                    type="text"
                    name="sourceProject"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source PO Number
                  </label>
                  <input
                    type="text"
                    name="sourcePONumber"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source Issue Number
                  </label>
                  <input
                    type="text"
                    name="sourceIssueNumber"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source Unit Rate
                  </label>
                  <input
                    type="number"
                    name="sourceUnitRate"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warehouse Location *
                  </label>
                  <input
                    type="text"
                    name="warehouseLocation"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter warehouse location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Yard/Room/Rack-Bin *
                  </label>
                  <input
                    type="text"
                    name="yardRoomRackBin"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter yard/room/rack-bin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Received in Warehouse Date
                  </label>
                  <input
                    type="date"
                    name="receivedInWarehouseDate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Consignment Note Number
                  </label>
                  <input
                    type="text"
                    name="consignmentNoteNumber"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter consignment note number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && selectedMaterial && (
        <ProjectReturnMaterialRequestForm
          materialId={selectedMaterial.materialid}
          materialDescription={selectedMaterial.materialDescription}
          availableQuantity={selectedMaterial.quantity}
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleSubmitRequest}
          isSaving={isSaving}
        />
      )}

      {/* Issue Form Modal */}
      {showIssueForm && selectedMaterial && (
        <ProjectReturnMaterialIssueForm
          materialId={selectedMaterial.materialid}
          materialDescription={selectedMaterial.materialDescription}
          availableQuantity={selectedMaterial.quantity}
          onClose={() => setShowIssueForm(false)}
          onSubmit={handleSubmitIssue}
          isSaving={isSaving}
        />
      )}

      {/* Import CSV Form Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Import Project Return Materials from Excel/CSV</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput?.files?.[0]) {
                handleImportCSV(fileInput.files[0]);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Excel/CSV File *
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-medium mb-2">Expected columns:</p>
                <p className="text-xs">Material Code*, Material Description*, UOM*, Quantity*, Source Project*, Warehouse Location*, Yard/Room/Rack-Bin*, Source PO Number, Source Issue Number, Source Unit Rate, Received in Warehouse Date, Consignment Note Number, Remarks</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">* Required fields</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download Template
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispose Material Modal */}
      {showDisposeModal && materialToDispose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dispose Material</h2>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 font-medium">
                ⚠️ This action is irreversible and will move the material to scrap status.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Material Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Material ID
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {materialToDispose.materialid}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Material Code
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {materialToDispose.materialCode}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {materialToDispose.materialDescription}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit of Measure
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {materialToDispose.uom}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Quantity
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {materialToDispose.quantity.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Rate
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(materialToDispose.sourceUnitRate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Value
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format((materialToDispose.quantity || 0) * (materialToDispose.sourceUnitRate || 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDisposeModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispose}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Disposing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Dispose Material
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

