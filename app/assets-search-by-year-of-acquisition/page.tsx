'use client';
import { useState, useEffect } from 'react';
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';

interface Asset {
  _id: string;
  assetnumber: string;
  assetdescription: string;
  assetcategory: string;
  assetsubcategory: string;
  assetstatus: string;
  acquiredvalue: number;
  acquireddate: Date;
  assetmanufacturer: string;
  assetmodel: string;
}

export default function AssetsSearchByYearOfAcquisitionPage() {
  const [data, setData] = useState<Asset[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);

  // Generate years from 2010 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2010 + 2 }, (_, i) => 2010 + i).reverse();

  const searchAssets = async (year: string) => {
    if (!year?.trim()) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year?.trim()) params.append('year', year);

      const response = await fetch(`/api/assets/search-by-year-of-acquisition?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      searchAssets(selectedYear);
    } else {
      setData([]);
    }
  }, [selectedYear]);

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'assetnumber',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Asset Number
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <Link href={`/asset/${row.original.assetnumber}`} className="text-blue-400 hover:text-blue-300">
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'acquireddate',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Acquisition Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('acquireddate') as Date;
        return (
          <div className="text-[12px] text-slate-800 dark:text-slate-400">
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </div>
        );
      },
    },
    { accessorKey: 'assetdescription', header: 'Description' },
    { accessorKey: 'assetcategory', header: 'Category' },
    { accessorKey: 'assetsubcategory', header: 'Subcategory' },
    { accessorKey: 'assetmanufacturer', header: 'Manufacturer' },
    { accessorKey: 'assetmodel', header: 'Model' },
    { accessorKey: 'assetstatus', header: 'Status' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">Fixed Assets Search by Year of Acquisition</h1>
      </div>

      <div className="mb-6 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full max-w-sm px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md"
          >
            <option value="">Select a year...</option>
            <option value="pre-2010">Pre-2010</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">Select a year to search for fixed assets acquired in that year.</p>
      </div>

      <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {selectedYear ? `No fixed assets found ${selectedYear === 'pre-2010' ? 'for pre-2010' : `for year ${selectedYear}`}` : 'Select a year to search for fixed assets'}
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">Found {data.length} fixed asset{data.length !== 1 ? 's' : ''} acquired {selectedYear === 'pre-2010' ? 'before 2010' : `in ${selectedYear}`}</p>
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
