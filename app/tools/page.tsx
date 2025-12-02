'use client';
import { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  // Network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.2 * (1 - distance / 120)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
          className="text-teal-400 hover:text-teal-300 transition-colors"
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
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTool(row.original.assetnumber)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-400"></div>
        <p className="text-white ml-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                    Tools Management
                  </h1>
                  <p className="text-white text-lg">Manage and track your tools inventory</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  Add Tool
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search tools..."
              className="w-full max-w-sm px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Table Section */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
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
        </div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Add New Tool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Description *
              </label>
              <input
                type="text"
                required
                value={formData.toolDescription}
                onChange={(e) => setFormData({ ...formData, toolDescription: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.toolCost}
                onChange={(e) => setFormData({ ...formData, toolCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchasedDate ? (formData.purchasedDate instanceof Date ? formData.purchasedDate.toISOString().split('T')[0] : formData.purchasedDate) : ''}
                onChange={(e) => setFormData({ ...formData, purchasedDate: new Date(e.target.value) })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase PO Number
              </label>
              <input
                type="text"
                value={formData.purchasePONumber}
                onChange={(e) => setFormData({ ...formData, purchasePONumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase Supplier
              </label>
              <input
                type="text"
                value={formData.purchaseSupplier}
                onChange={(e) => setFormData({ ...formData, purchaseSupplier: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Status
              </label>
              <select
                value={formData.toolStatus}
                onChange={(e) => setFormData({ ...formData, toolStatus: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Location
              </label>
              <select
                value={formData.toolLocation}
                onChange={(e) => setFormData({ ...formData, toolLocation: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Project Site">Project Site</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Condition
              </label>
              <select
                value={formData.toolCondition}
                onChange={(e) => setFormData({ ...formData, toolCondition: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Accessories
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Notes
              </label>
              <textarea
                value={formData.toolNotes}
                onChange={(e) => setFormData({ ...formData, toolNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Tool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool ID
              </label>
              <input
                type="text"
                value={formData.assetnumber}
                disabled
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Description *
              </label>
              <input
                type="text"
                required
                value={formData.toolDescription}
                onChange={(e) => setFormData({ ...formData, toolDescription: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.toolCost}
                onChange={(e) => setFormData({ ...formData, toolCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchasedDate ? new Date(formData.purchasedDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, purchasedDate: new Date(e.target.value) })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase PO Number
              </label>
              <input
                type="text"
                value={formData.purchasePONumber}
                onChange={(e) => setFormData({ ...formData, purchasePONumber: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Purchase Supplier
              </label>
              <input
                type="text"
                value={formData.purchaseSupplier}
                onChange={(e) => setFormData({ ...formData, purchaseSupplier: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Status
              </label>
              <select
                value={formData.toolStatus}
                onChange={(e) => setFormData({ ...formData, toolStatus: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Location
              </label>
              <select
                value={formData.toolLocation}
                onChange={(e) => setFormData({ ...formData, toolLocation: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Project Site">Project Site</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tool Condition
              </label>
              <select
                value={formData.toolCondition}
                onChange={(e) => setFormData({ ...formData, toolCondition: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Accessories
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Notes
              </label>
              <textarea
                value={formData.toolNotes}
                onChange={(e) => setFormData({ ...formData, toolNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300"
            >
              Update Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
