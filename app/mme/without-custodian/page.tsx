'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { AssetQRCode } from '@/components/AssetQRCode';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';

interface Equipment {
  _id: string;
  assetnumber: string;
  assetdescription: string;
  assetcategory: string;
  assetsubcategory: string;
  assetstatus: string;
  acquiredvalue: number;
  acquireddate: Date | string;
  assetmanufacturer: string;
  assetmodel: string;
  assetserialnumber: string;
}

export default function MMEWithoutCustodianPage() {
  const [data, setData] = useState<Equipment[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter states
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000000);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (minValue > 0) params.append('minValue', minValue.toString());
      if (maxValue < 1000000) params.append('maxValue', maxValue.toString());
      if (minDate) params.append('minDate', minDate.toISOString().split('T')[0]);
      if (maxDate) params.append('maxDate', maxDate.toISOString().split('T')[0]);

      const response = await fetch(`/api/mme/without-custodian?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const result = await response.json();
      console.log('API Response:', result);
      // Handle both array and object with data property
      const equipmentData = Array.isArray(result) ? result : (result.data || []);
      setData(equipmentData);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Mouse event handlers for slider dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
      if (!sliderContainer) return;
      
      const rect = sliderContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newValue = Math.round(percentage * 1000000 / 10000) * 10000;
      
      if (isDragging === 'min' && newValue <= maxValue) {
        setMinValue(newValue);
      } else if (isDragging === 'max' && newValue >= minValue) {
        setMaxValue(newValue);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minValue, maxValue]);

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
  
  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: 'assetnumber',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Asset Number
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link 
          href={`/asset/${row.original.assetnumber}`}
          className="text-teal-400 hover:text-teal-300 transition-colors"
        >
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'assetdescription',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => <div className="max-w-[300px] truncate text-[12px] text-white">{row.getValue('assetdescription')}</div>,
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
      accessorKey: 'assetstatus',
      header: 'Status',
    },
    {
      accessorKey: 'acquiredvalue',
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
        const value = row.getValue('acquiredvalue');
        return typeof value === 'number' ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value) : 'N/A';
      }
    },
    {
      accessorKey: 'acquireddate',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Acquiring Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('acquireddate') as string;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
    {
      header: 'QR Code',
      cell: ({ row }) => <AssetQRCode assetNumber={row.original.assetnumber} assetType="mme" />
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              MME Equipment Without Custodian
            </h1>
            <p className="text-white/80 text-lg">Search for MME equipment without custodian information</p>
          </div>
        </div>
      
        {/* User Message - Above Filters */}
        {!hasSearched && (
          <div className="mb-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
            <p className="text-sm text-white/80">
              Please set your filters (acquisition value range and date range) and click Search to view MME equipment without custodian information.
            </p>
          </div>
        )}
      
        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg relative" style={{ zIndex: 1 }}>
        <div className="space-y-4">
          {/* Value Range Slider */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">
              Acquisition Value Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()} SAR
            </label>
            <div className="relative h-8 slider-container" style={{ zIndex: 10 }}>
              {/* Background track */}
              <div className="absolute top-4 left-0 right-0 h-2 bg-white/20 rounded-lg pointer-events-none"></div>
              
              {/* Active range track */}
              <div 
                className="absolute top-4 h-2 bg-teal-400 rounded-lg pointer-events-none"
                style={{
                  left: `${(minValue / 1000000) * 100}%`,
                  width: `${((maxValue - minValue) / 1000000) * 100}%`
                }}
              ></div>
              
              {/* Track click handler */}
              <div 
                className="absolute top-0 left-0 right-0 h-8 cursor-pointer z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newValue = Math.round(percentage * 1000000 / 10000) * 10000;
                  
                  // Determine which thumb to move based on which is closer
                  const minDistance = Math.abs(newValue - minValue);
                  const maxDistance = Math.abs(newValue - maxValue);
                  
                  if (minDistance < maxDistance) {
                    if (newValue <= maxValue) {
                      setMinValue(newValue);
                    }
                  } else {
                    if (newValue >= minValue) {
                      setMaxValue(newValue);
                    }
                  }
                }}
              ></div>
              
              {/* Min value thumb */}
              <div 
                className="absolute top-2 w-4 h-4 bg-teal-400 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-teal-500 transition-colors z-30"
                style={{ left: `calc(${(minValue / 1000000) * 100}% - 8px)`, pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging('min');
                }}
              ></div>
              
              {/* Max value thumb */}
              <div 
                className="absolute top-2 w-4 h-4 bg-teal-400 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-teal-500 transition-colors z-30"
                style={{ left: `calc(${(maxValue / 1000000) * 100}% - 8px)`, pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging('max');
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>0 SAR</span>
              <span>1,000,000 SAR</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-[200px]">
              <label className="block text-sm font-medium mb-2 text-white">
                From Date
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
              <DatePicker
                selected={minDate}
                onChange={(date: Date | null) => setMinDate(date)}
                selectsStart
                startDate={minDate || undefined}
                endDate={maxDate || undefined}
                maxDate={maxDate || undefined}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select start date"
                  popperClassName="react-datepicker-popper"
                />
              </div>
            </div>
            <div className="flex-1 max-w-[200px]">
              <label className="block text-sm font-medium mb-2 text-white">
                To Date
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
              <DatePicker
                selected={maxDate}
                onChange={(date: Date | null) => setMaxDate(date)}
                selectsEnd
                startDate={minDate || undefined}
                endDate={maxDate || undefined}
                minDate={minDate || undefined}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select end date"
                  popperClassName="react-datepicker-popper"
                />
              </div>
            </div>
            <div className="flex-1 max-w-[150px]">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full px-6 py-2 bg-teal-400 hover:bg-teal-500 disabled:bg-teal-300 text-white rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Results Section */}
        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-8 text-white/70">
              No search performed yet. Use the filters above to search for equipment.
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              No MME equipment found without custodian information matching the selected filters
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-white/20">
                <p className="text-sm text-white/80">
                  Found {data.length} equipment item{data.length !== 1 ? 's' : ''} without custodian information
                </p>
              </div>
              <ResponsiveTanStackTable
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                getRowId={(row) => row._id}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

