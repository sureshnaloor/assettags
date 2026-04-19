'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';

const DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 5;

interface LocationResult {
  _id: string;
  assetnumber: string;
  locationType: string;
  locationValue: string;
  warehouseLocation?: string;
  departmentLocation?: string;
  warehouseCity?: string;
  employeenumber: string;
  employeename: string;
  custodyfrom: string;
  custodyto?: string | null;
  project?: string;
  projectname?: string;
  assetdescription?: string;
  assetcategory?: string;
  assetsubcategory?: string;
  assetstatus?: string;
  assetmanufacturer?: string;
  assetmodel?: string;
  assetserialnumber?: string;
  acquireddate?: string;
  acquiredvalue?: number;
}

export default function MMESearchByLocationPage() {
  const [data, setData] = useState<LocationResult[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number }>>([]);
  const animationFrameRef = useRef<number>();

  const runSearch = useCallback(async (term: string) => {
    const trimmed = (term || '').trim();
    if (!trimmed) {
      setData([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ type: 'mme', search: trimmed });
      const response = await fetch(`/api/equipment/search-by-location?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching equipment by location:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByLocation = () => runSearch(searchText);

  // Debounced search when user types at least MIN_SEARCH_LENGTH characters
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setData([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => runSearch(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, runSearch]);

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
        radius: Math.random() * 3 + 1,
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
        particlesRef.current.forEach((other, j) => {
          if (i !== j) {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
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
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const columns: ColumnDef<LocationResult>[] = [
    {
      accessorKey: 'assetnumber',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Asset Number
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link href={`/asset/${row.original.assetnumber}`} className="text-teal-400 hover:text-teal-300 transition-colors">
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'locationType',
      header: 'Location Type',
      cell: ({ row }) => <div className="text-[12px] text-white capitalize">{row.getValue('locationType') || '—'}</div>,
    },
    {
      accessorKey: 'locationValue',
      header: 'Location',
      cell: ({ row }) => <div className="text-[12px] text-white">{row.original.locationValue || row.original.warehouseLocation || row.original.departmentLocation || '—'}</div>,
    },
    { accessorKey: 'warehouseCity', header: 'City', cell: ({ row }) => <div className="text-[12px] text-white">{row.original.warehouseCity || '—'}</div> },
    { accessorKey: 'employeename', header: 'Custodian', cell: ({ row }) => <div className="text-[12px] text-white">{row.original.employeename || '—'}</div> },
    {
      accessorKey: 'custodyfrom',
      header: 'Custody From',
      cell: ({ row }) => (
        <div className="text-[12px] text-white">
          {row.original.custodyfrom ? new Date(row.original.custodyfrom).toLocaleDateString() : '—'}
        </div>
      ),
    },
    { accessorKey: 'assetdescription', header: 'Description', cell: ({ row }) => <div className="text-[12px] text-white max-w-[200px] truncate" title={row.original.assetdescription}>{row.original.assetdescription || '—'}</div> },
    { accessorKey: 'assetcategory', header: 'Category', cell: ({ row }) => <div className="text-[12px] text-white">{row.original.assetcategory || '—'}</div> },
    { accessorKey: 'assetstatus', header: 'Status', cell: ({ row }) => <div className="text-[12px] text-white">{row.original.assetstatus || '—'}</div> },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              MME Search by Location
            </h1>
            <p className="text-white/80 text-lg">Find MME equipment by location. Type at least 5 characters; use * as wildcard (e.g. *camp* or safco).</p>
          </div>
        </div>

        <div className="mb-6 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="location-search" className="block text-sm font-medium text-white/80 mb-1">Location search</label>
              <input
                id="location-search"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchByLocation()}
                placeholder="e.g. *camp* or safco (min 5 chars)"
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={searchByLocation}
              disabled={loading || searchText.trim().length < MIN_SEARCH_LENGTH}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="mt-3 text-xs text-white/70">Search runs after you type at least 5 characters (debounced). Searches warehouse, department, and camp/office locations; case-insensitive. Use * as wildcard.</p>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400" />
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-8 text-white/70">
              Enter at least 5 characters to search by location (e.g. &quot;camp&quot; or &quot;*safco*&quot;). Search runs automatically.
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              No MME equipment found for location &quot;{searchText.trim()}&quot;
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-white/20">
                <p className="text-sm text-white/80">
                  Found {data.length} MME record{data.length !== 1 ? 's' : ''} for location &quot;{searchText.trim()}&quot;
                </p>
              </div>
              <ResponsiveTanStackTable
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                getRowId={(row) => (row as LocationResult)._id ?? (row as LocationResult).assetnumber}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
