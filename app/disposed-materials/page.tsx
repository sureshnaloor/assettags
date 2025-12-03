'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Trash2, AlertTriangle, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { DisposedMaterial } from '@/types/projectreturnmaterials';

export default function DisposedMaterialsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  const [data, setData] = useState<DisposedMaterial[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisposedMaterials();
  }, []);

  // Animated particle background
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

    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.fill();

        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
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

  const fetchDisposedMaterials = async () => {
    try {
      const response = await fetch('/api/disposed-materials');
      if (!response.ok) throw new Error('Failed to fetch disposed materials');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching disposed materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<DisposedMaterial>[] = [
    {
      accessorKey: 'materialid',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 text-white hover:text-teal-400"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Material ID
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => (
        <Link 
          href={`/disposed-materials/${row.getValue('materialid')}`}
          className="font-mono text-sm text-teal-400 hover:text-teal-300 hover:underline transition-colors"
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
            <div className="font-semibold text-white text-sm">
              {materialCode}
            </div>
            <div className="text-white/80 text-xs max-w-xs truncate" title={materialDescription}>
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
      accessorKey: 'disposedQuantity',
      header: 'Disposal Details',
      cell: ({ row }) => {
        const disposedQuantity = row.getValue('disposedQuantity') as number;
        const disposedValue = row.original.disposedValue;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-white text-sm">
              Qty: {disposedQuantity.toLocaleString()}
            </div>
            <div className="text-white/80 text-xs">
              Value: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'SAR'
              }).format(disposedValue)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'sourceProject',
      header: 'Project Info',
      cell: ({ row }) => {
        const sourceProject = row.getValue('sourceProject') as string;
        const sourceWBS = row.original.sourceWBS;
        return (
          <div className="space-y-1">
            <div className="font-semibold text-white text-sm">
              {sourceProject}
            </div>
            <div className="text-white/80 text-xs">
              WBS: {sourceWBS}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'warehouseLocation',
      header: 'Warehouse Location',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'disposedBy',
      header: 'Disposal Info',
      cell: ({ row }) => {
        const disposedBy = row.getValue('disposedBy') as string;
        const disposedAt = row.original.disposedAt;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-white/70" />
              <span className="text-sm font-semibold text-white">{disposedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-white/70" />
              <span className="text-xs text-white/80">
                {new Date(disposedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 container mx-auto p-4 min-h-screen">
        {/* Header Section */}
        <div className="mb-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
              Disposed Materials
            </h1>
          </div>
          <p className="text-white/80 text-lg">
            Materials that have been disposed and moved to scrap status
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-2">
                Search Disposed Materials
              </label>
              <input
                type="text"
                placeholder="Search materials..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl">
          <ResponsiveTanStackTable
            data={data}
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

        {/* Empty State */}
        {data.length === 0 && (
          <div className="text-center py-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl mt-6">
            <AlertTriangle className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Disposed Materials
            </h3>
            <p className="text-white/70">
              No materials have been disposed yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
