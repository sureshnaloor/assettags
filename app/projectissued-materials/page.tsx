'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, Edit, Trash2, Upload, Download, Package, Send, ClipboardList, ArrowRightLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { ProjectIssuedMaterialData } from '@/types/projectissuedmaterials';
import AssetQRCode from '@/components/AssetQRCode';
import MaterialRequestForm from '@/components/MaterialRequestForm';
import MaterialIssueForm from '@/components/MaterialIssueForm';

export default function ProjectIssuedMaterialsPage() {
  const [data, setData] = useState<ProjectIssuedMaterialData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProjectIssuedMaterialData | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showIssueImportForm, setShowIssueImportForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ProjectIssuedMaterialData | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingIssues, setIsImportingIssues] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/projectissued-materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique projects for filter dropdown
  const uniqueProjects = Array.from(new Set(data.map(material => material.sourceProject).filter(Boolean)));

  // Filter data based on project filter
  const filteredData = projectFilter === 'all' 
    ? data 
    : data.filter(material => material.sourceProject === projectFilter);

  const handleAddMaterial = async (materialData: Partial<ProjectIssuedMaterialData>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectissued-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error('Failed to add material');
      
      await fetchMaterials();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditMaterial = async (materialId: string, materialData: Partial<ProjectIssuedMaterialData>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projectissued-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error('Failed to update material');
      
      await fetchMaterials();
      setEditingMaterial(null);
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
      const response = await fetch(`/api/projectissued-materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');
      
      await fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleDownloadMaterialTemplate = async () => {
    try {
      const response = await fetch('/api/projectissued-materials/template');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'materials_template.xlsx';
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

      const response = await fetch('/api/projectissued-materials/import', {
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

  const handleDownloadIssueTemplate = async () => {
    try {
      const response = await fetch('/api/projectissued-materials/issues/template');
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'material_issues_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleImportIssues = async (file: File) => {
    setIsImportingIssues(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/projectissued-materials/issues/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to import material issues';
        
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
      let message = `Successfully imported ${result.imported} out of ${result.total} material issues.`;
      
      if (result.errors && result.errors.length > 0) {
        message += `\n\nErrors:\n${result.errors.slice(0, 10).join('\n')}`;
        if (result.errors.length > 10) {
          message += `\n... and ${result.errors.length - 10} more errors`;
        }
      }
      
      if (result.failedIssues && result.failedIssues.length > 0) {
        message += `\n\nFailed Issues:\n${result.failedIssues.slice(0, 10).join('\n')}`;
        if (result.failedIssues.length > 10) {
          message += `\n... and ${result.failedIssues.length - 10} more failures`;
        }
      }
      
      alert(message);
      
      await fetchMaterials();
      setShowIssueImportForm(false);
    } catch (error: any) {
      console.error('Error importing material issues:', error);
      alert(error.message || 'Failed to import material issues');
    } finally {
      setIsImportingIssues(false);
    }
  };

  const handleRequestMaterial = (material: ProjectIssuedMaterialData) => {
    setSelectedMaterial(material);
    setShowRequestForm(true);
  };

  const handleIssueMaterial = (material: ProjectIssuedMaterialData) => {
    setSelectedMaterial(material);
    setShowIssueForm(true);
  };

  const handleTransferMaterial = (material: ProjectIssuedMaterialData) => {
    setSelectedMaterial(material);
    setShowTransferForm(true);
  };

  const handleSubmitRequest = async (requestData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectissued-materials/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      await fetchMaterials();
      setShowRequestForm(false);
      setSelectedMaterial(null);
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
      const response = await fetch('/api/projectissued-materials/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) throw new Error('Failed to issue material');
      
      await fetchMaterials();
      setShowIssueForm(false);
      setSelectedMaterial(null);
      alert('Material issued successfully');
    } catch (error) {
      console.error('Error issuing material:', error);
      alert('Failed to issue material');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitTransfer = async (transferData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/projectissued-materials/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: selectedMaterial?._id,
          transferData: transferData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transfer material');
      }
      
      const result = await response.json();
      await fetchMaterials();
      setShowTransferForm(false);
      setSelectedMaterial(null);
      alert(`Material transferred successfully. Transferred quantity: ${result.transferredQuantity}`);
    } catch (error: any) {
      console.error('Error transferring material:', error);
      alert(error.message || 'Failed to transfer material');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<ProjectIssuedMaterialData>[] = [
    {
      accessorKey: 'materialid',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Material ID
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link 
          href={`/projectissued-materials/${row.original.materialid}`}
          className="text-blue-400 hover:text-blue-300 font-mono text-sm"
        >
          {row.original.materialid}
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
          <div className="space-y-1 min-w-[200px]">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {materialCode}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs max-w-[180px] truncate" title={materialDescription}>
              {materialDescription}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'uom',
      header: 'UOM',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {row.getValue('uom')}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Info',
      cell: ({ row }) => {
        const quantity = row.getValue('quantity') as number;
        const pendingRequests = row.original.pendingRequests;
        return (
          <div className="space-y-1 min-w-[120px]">
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
        const sourceWBS = row.original.sourceWBS;
        const sourcePONumber = row.original.sourcePONumber;
        const sourceIssueNumber = row.original.sourceIssueNumber;
        return (
          <div className="space-y-1 min-w-[180px]">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {sourceProject}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-0.5">
              <div>WBS: {sourceWBS}</div>
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
        return (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'SAR'
            }).format(value)}
          </span>
        );
      }
    },
    {
      accessorKey: 'gatepassNumber',
      header: 'Receipt Info',
      cell: ({ row }) => {
        const gatepassNumber = row.getValue('gatepassNumber') as string;
        const receivedByEmpNumber = row.original.receivedByEmpNumber;
        const receivedByEmpName = row.original.receivedByEmpName;
        return (
          <div className="space-y-1 min-w-[150px]">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {gatepassNumber || 'No Gatepass'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-0.5">
              {receivedByEmpNumber && <div>Emp #: {receivedByEmpNumber}</div>}
              {receivedByEmpName && <div>Name: {receivedByEmpName}</div>}
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
          assetType="Project Issued Material" 
        />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        // Calculate balance quantity (available quantity - pending requests)
        // Note: This is a simplified calculation. In a real scenario, you might want to
        // fetch the actual issued quantities from the materialissues collection
        const balanceQuantity = row.original.quantity - (row.original.pendingRequests || 0);
        const canTransfer = balanceQuantity > 0;
        
        return (
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
            {canTransfer && (
              <button
                onClick={() => handleTransferMaterial(row.original)}
                className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                title="Transfer to Return Materials"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setEditingMaterial(row.original)}
              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Edit Material"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteMaterial(row.original.materialid)}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete Material"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
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
            Project Issued Materials Management
          </h1>
        </div>
        
        {/* Action Icons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/projectissued-materials/requests"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group relative"
            title="Requests Pending"
          >
            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Requests Pending
            </span>
          </Link>
          <button
            onClick={() => setShowImportForm(true)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors group relative"
            title="Import Materials CSV"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Import Materials CSV
            </span>
          </button>
          <button
            onClick={() => setShowIssueImportForm(true)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors group relative"
            title="Import Material Issues"
          >
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Import Material Issues
            </span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group relative"
            title="Add Material"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Add Material
            </span>
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-4">
        {/* Project Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Project
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects ({data.length})</option>
              {uniqueProjects.map((project) => (
                <option key={project} value={project}>
                  {project} ({data.filter(m => m.sourceProject === project).length})
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <ResponsiveTanStackTable
            data={filteredData}
            columns={columns}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            getRowId={(row) => row._id || row.materialid}
          />
        </div>
      </div>

      {/* Add Material Form Modal */}
      {showAddForm && (
        <AddMaterialForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddMaterial}
          isSaving={isSaving}
        />
      )}

      {/* Edit Material Form Modal */}
      {editingMaterial && (
        <EditMaterialForm
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onSubmit={(materialData) => handleEditMaterial(editingMaterial.materialid, materialData)}
          isSaving={isSaving}
        />
      )}

      {/* Import CSV Form Modal */}
      {showImportForm && (
        <ImportCSVForm
          onClose={() => setShowImportForm(false)}
          onSubmit={handleImportCSV}
          onDownloadTemplate={handleDownloadMaterialTemplate}
          isImporting={isImporting}
        />
      )}

      {/* Import Material Issues Form Modal */}
      {showIssueImportForm && (
        <ImportIssuesForm
          onClose={() => setShowIssueImportForm(false)}
          onSubmit={handleImportIssues}
          onDownloadTemplate={handleDownloadIssueTemplate}
          isImporting={isImportingIssues}
        />
      )}

      {/* Request Form Modal */}
      {showRequestForm && selectedMaterial && (
        <MaterialRequestForm
          materialId={selectedMaterial.materialid}
          materialDescription={selectedMaterial.materialDescription}
          availableQuantity={selectedMaterial.quantity}
          onClose={() => {
            setShowRequestForm(false);
            setSelectedMaterial(null);
          }}
          onSubmit={handleSubmitRequest}
          isSaving={isSaving}
        />
      )}

      {/* Issue Form Modal */}
      {showIssueForm && selectedMaterial && (
        <MaterialIssueForm
          materialId={selectedMaterial.materialid}
          materialDescription={selectedMaterial.materialDescription}
          availableQuantity={selectedMaterial.quantity}
          onClose={() => {
            setShowIssueForm(false);
            setSelectedMaterial(null);
          }}
          onSubmit={handleSubmitIssue}
          isSaving={isSaving}
        />
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && selectedMaterial && (
        <TransferMaterialForm
          material={selectedMaterial}
          onClose={() => {
            setShowTransferForm(false);
            setSelectedMaterial(null);
          }}
          onSubmit={handleSubmitTransfer}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// Add Material Form Component
function AddMaterialForm({ onClose, onSubmit, isSaving }: { onClose: () => void; onSubmit: (data: Partial<ProjectIssuedMaterialData>) => void; isSaving?: boolean }) {
  const [formData, setFormData] = useState<Partial<ProjectIssuedMaterialData>>({
    materialCode: '',
    materialDescription: '',
    uom: '',
    quantity: 0,
    pendingRequests: 0,
    sourceProject: '',
    sourceWBS: '',
    sourcePONumber: '',
    sourceIssueNumber: '',
    sourceUnitRate: 0,
    gatepassNumber: '',
    receivedByEmpNumber: '',
    receivedByEmpName: '',
    testDocs: [],
    remarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Project Issued Material</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Code *
              </label>
              <input
                type="text"
                required
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                UOM *
              </label>
              <input
                type="text"
                required
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Description *
              </label>
              <input
                type="text"
                required
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Project *
              </label>
              <input
                type="text"
                required
                value={formData.sourceProject}
                onChange={(e) => setFormData({ ...formData, sourceProject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source PO Number *
              </label>
              <input
                type="text"
                required
                value={formData.sourcePONumber}
                onChange={(e) => setFormData({ ...formData, sourcePONumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Issue Number *
              </label>
              <input
                type="text"
                required
                value={formData.sourceIssueNumber}
                onChange={(e) => setFormData({ ...formData, sourceIssueNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Unit Rate *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sourceUnitRate}
                onChange={(e) => setFormData({ ...formData, sourceUnitRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source WBS *
              </label>
              <input
                type="text"
                required
                value={formData.sourceWBS}
                onChange={(e) => setFormData({ ...formData, sourceWBS: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter source WBS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gatepass Number
              </label>
              <input
                type="text"
                value={formData.gatepassNumber}
                onChange={(e) => setFormData({ ...formData, gatepassNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gatepass number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received By Employee Number
              </label>
              <input
                type="text"
                value={formData.receivedByEmpNumber}
                onChange={(e) => setFormData({ ...formData, receivedByEmpNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter employee number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received By Employee Name
              </label>
              <input
                type="text"
                value={formData.receivedByEmpName}
                onChange={(e) => setFormData({ ...formData, receivedByEmpName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter employee name"
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
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Material Form Component
function EditMaterialForm({ material, onClose, onSubmit, isSaving }: { material: ProjectIssuedMaterialData; onClose: () => void; onSubmit: (data: Partial<ProjectIssuedMaterialData>) => void; isSaving?: boolean }) {
  const [formData, setFormData] = useState<Partial<ProjectIssuedMaterialData>>(material);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Project Issued Material</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material ID
              </label>
              <input
                type="text"
                value={formData.materialid}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Code *
              </label>
              <input
                type="text"
                required
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                UOM *
              </label>
              <input
                type="text"
                required
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Description *
              </label>
              <input
                type="text"
                required
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Project *
              </label>
              <input
                type="text"
                required
                value={formData.sourceProject}
                onChange={(e) => setFormData({ ...formData, sourceProject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source PO Number *
              </label>
              <input
                type="text"
                required
                value={formData.sourcePONumber}
                onChange={(e) => setFormData({ ...formData, sourcePONumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Issue Number *
              </label>
              <input
                type="text"
                required
                value={formData.sourceIssueNumber}
                onChange={(e) => setFormData({ ...formData, sourceIssueNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Unit Rate *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sourceUnitRate}
                onChange={(e) => setFormData({ ...formData, sourceUnitRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source WBS *
              </label>
              <input
                type="text"
                required
                value={formData.sourceWBS}
                onChange={(e) => setFormData({ ...formData, sourceWBS: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter source WBS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gatepass Number
              </label>
              <input
                type="text"
                value={formData.gatepassNumber}
                onChange={(e) => setFormData({ ...formData, gatepassNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gatepass number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received By Employee Number
              </label>
              <input
                type="text"
                value={formData.receivedByEmpNumber}
                onChange={(e) => setFormData({ ...formData, receivedByEmpNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter employee number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received By Employee Name
              </label>
              <input
                type="text"
                value={formData.receivedByEmpName}
                onChange={(e) => setFormData({ ...formData, receivedByEmpName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter employee name"
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
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Updating...' : 'Update Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import CSV Form Component
function ImportCSVForm({ 
  onClose, 
  onSubmit, 
  onDownloadTemplate,
  isImporting
}: { 
  onClose: () => void; 
  onSubmit: (file: File) => void;
  onDownloadTemplate: () => void;
  isImporting?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Import Project Issued Materials from Excel/CSV</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excel/CSV File *
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-medium mb-2">Expected columns:</p>
            <p className="text-xs">Material Code*, Material Description*, UOM*, Quantity*, Source Project*, Source WBS*, Source PO Number*, Source Issue Number*, Source Unit Rate*, Gatepass Number, Received By Employee Number, Received By Employee Name, Remarks</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">* Required fields</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Download Template
            </button>
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
  );
}

// Import Material Issues Form Component
function ImportIssuesForm({ 
  onClose, 
  onSubmit, 
  onDownloadTemplate,
  isImporting
}: { 
  onClose: () => void; 
  onSubmit: (file: File) => void;
  onDownloadTemplate: () => void;
  isImporting?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Import Material Issues from Excel/CSV</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excel/CSV File *
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-medium mb-2">Expected columns:</p>
            <p className="text-xs">Material ID, Drawing Number, Equipment, Room, Requestor Name, Quantity Requested, Issuer Name, Issue Quantity, Remarks</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-xs mb-1">⚠️ Important Note:</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Material Issues are transaction records for existing materials. The Material ID must already exist in your materials inventory. 
                If you need to add new materials, use the "Import Materials CSV" button instead.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Download Template
            </button>
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
              disabled={isImporting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isImporting ? 'Importing...' : 'Import Issues'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Transfer Material Form Component
function TransferMaterialForm({ 
  material, 
  onClose, 
  onSubmit,
  isSaving
}: { 
  material: ProjectIssuedMaterialData; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  isSaving?: boolean;
}) {
  const [formData, setFormData] = useState({
    warehouseLocation: '',
    yardRoomRackBin: '',
    receivedInWarehouseDate: new Date().toISOString().split('T')[0],
    consignmentNoteNumber: '',
    remarks: material.remarks || ''
  });

  // Calculate balance quantity (available quantity - pending requests)
  // Note: This is a simplified calculation. The actual balance will be calculated
  // on the server side by checking the materialissues collection
  const balanceQuantity = material.quantity - (material.pendingRequests || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Transfer Material to Return Materials
        </h2>
        
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Material Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Material ID:</span> {material.materialid}
            </div>
            <div>
              <span className="font-medium">Description:</span> {material.materialDescription}
            </div>
            <div>
              <span className="font-medium">Available Quantity:</span> {material.quantity.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Pending Requests:</span> {(material.pendingRequests || 0).toLocaleString()}
            </div>
            <div className="col-span-2">
              <span className="font-medium text-green-600 dark:text-green-400">
                Balance Quantity to Transfer: {balanceQuantity.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Warehouse Location *
              </label>
              <input
                type="text"
                required
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter warehouse location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yard/Room/Rack/Bin *
              </label>
              <input
                type="text"
                required
                value={formData.yardRoomRackBin}
                onChange={(e) => setFormData({ ...formData, yardRoomRackBin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter yard/room/rack/bin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received in Warehouse Date *
              </label>
              <input
                type="date"
                required
                value={formData.receivedInWarehouseDate}
                onChange={(e) => setFormData({ ...formData, receivedInWarehouseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consignment Note Number *
              </label>
              <input
                type="text"
                required
                value={formData.consignmentNoteNumber}
                onChange={(e) => setFormData({ ...formData, consignmentNoteNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter consignment note number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter any additional remarks"
              />
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Transfer Confirmation</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This action will transfer <strong>{balanceQuantity.toLocaleString()}</strong> units of this material 
              from Project Issued Materials to Project Return Materials. The material will be removed from 
              the issued materials list and added to the return materials list.
            </p>
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
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Transferring...' : 'Transfer Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
