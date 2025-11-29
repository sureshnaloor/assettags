'use client';
import { useState, useEffect } from 'react';
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

interface FixedAsset {
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

export default function FixedAssetWithoutCustodianPage() {
  const [data, setData] = useState<FixedAsset[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Filter states
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000000);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/fixedasset/categories');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Categories fetched:', data);
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (minValue > 0) params.append('minValue', minValue.toString());
      if (maxValue < 1000000) params.append('maxValue', maxValue.toString());
      if (minDate) params.append('minDate', minDate.toISOString().split('T')[0]);
      if (maxDate) params.append('maxDate', maxDate.toISOString().split('T')[0]);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/fixedasset/without-custodian?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch fixed assets');
      const result = await response.json();
      console.log('API Response:', result);
      // Handle both array and object with data property
      const assetData = Array.isArray(result) ? result : (result.data || []);
      setData(assetData);
    } catch (error) {
      console.error('Error fetching fixed assets:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Mouse event handlers for slider dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const sliderContainer = document.querySelector('.slider-container-fixedasset') as HTMLElement;
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
  
  const columns: ColumnDef<FixedAsset>[] = [
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
          href={`/fixedasset/${row.original.assetnumber}`}
          className="text-blue-400 hover:text-blue-300"
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
      cell: ({ row }) => <div className="max-w-[300px] truncate text-[12px] text-slate-800 dark:text-slate-400">{row.getValue('assetdescription')}</div>,
    },
    {
      accessorKey: 'assetcategory',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Category
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
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
      cell: ({ row }) => <AssetQRCode assetNumber={row.original.assetnumber} assetType="fixedasset" />
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">Fixed Assets Without Custodian</h1>
      </div>
      
      {/* User Message - Above Filters */}
      {!hasSearched && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Please set your filters (acquisition value range, date range, and category) and click Search to view fixed assets without custodian information.
          </p>
        </div>
      )}
      
      {/* Filters Section */}
      <div className="mb-6 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg relative" style={{ zIndex: 1 }}>
        <div className="space-y-4">
          {/* Value Range Slider */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
              Acquisition Value Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()} SAR
            </label>
            <div className="relative h-8 slider-container-fixedasset" style={{ zIndex: 10 }}>
              {/* Background track */}
              <div className="absolute top-4 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg pointer-events-none"></div>
              
              {/* Active range track */}
              <div 
                className="absolute top-4 h-2 bg-blue-500 rounded-lg pointer-events-none"
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
                className="absolute top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-30"
                style={{ left: `calc(${(minValue / 1000000) * 100}% - 8px)`, pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging('min');
                }}
              ></div>
              
              {/* Max value thumb */}
              <div 
                className="absolute top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-30"
                style={{ left: `calc(${(maxValue / 1000000) * 100}% - 8px)`, pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging('max');
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>0 SAR</span>
              <span>1,000,000 SAR</span>
            </div>
          </div>

          {/* Date Range and Category */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-[200px]">
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
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
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select start date"
                  popperClassName="react-datepicker-popper"
                />
              </div>
            </div>
            <div className="flex-1 max-w-[200px]">
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
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
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Select end date"
                  popperClassName="react-datepicker-popper"
                />
              </div>
            </div>
            <div className="flex-1 max-w-[200px]">
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Asset Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                disabled={loadingCategories}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 max-w-[150px]">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section with Gradient Background */}
      <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No search performed yet. Use the filters above to search for fixed assets.
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No fixed assets found without custodian information matching the selected filters
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Found {data.length} fixed asset{data.length !== 1 ? 's' : ''} without custodian information
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
  );
}

