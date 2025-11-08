'use client';
import { useState, useEffect } from 'react';
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';

interface Equipment {
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
  assetserialnumber: string;
}

interface Subcategory {
  _id: string;
  category: string;
  name: string;
}

export default function MMESearchBySubcategoryPage() {
  const [data, setData] = useState<Equipment[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoadingSubcategories(true);
      try {
        const response = await fetch('/api/subcategories/mme');
        if (!response.ok) throw new Error('Failed to fetch subcategories');
        const data = await response.json();
        setSubcategories(data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    fetchSubcategories();
  }, []);

  const searchEquipment = async (subcategory: string) => {
    if (!subcategory?.trim()) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subcategory?.trim()) params.append('subcategory', subcategory);

      const response = await fetch(`/api/mme/search-by-subcategory?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubcategory) {
      searchEquipment(selectedSubcategory);
    } else {
      setData([]);
    }
  }, [selectedSubcategory]);

  const columns: ColumnDef<Equipment>[] = [
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
      accessorKey: 'assetsubcategory',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Subcategory
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => <div className="text-[12px] text-slate-800 dark:text-slate-400">{row.getValue('assetsubcategory')}</div>,
    },
    {
      accessorKey: 'assetcategory',
      header: 'Category',
      cell: ({ row }) => <div className="text-[12px] text-slate-800 dark:text-slate-400">{row.getValue('assetcategory') || 'N/A'}</div>,
    },
    { accessorKey: 'assetdescription', header: 'Description' },
    { accessorKey: 'assetmanufacturer', header: 'Manufacturer' },
    { accessorKey: 'assetmodel', header: 'Model' },
    { accessorKey: 'assetserialnumber', header: 'Serial' },
    { accessorKey: 'assetstatus', header: 'Status' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">MME Search by Subcategory</h1>
      </div>

      <div className="mb-6 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex gap-4">
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="w-full max-w-sm px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md"
            disabled={loadingSubcategories}
          >
            <option value="">Select a subcategory...</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory.name}>
                {subcategory.name} {subcategory.category ? `(${subcategory.category})` : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">Select a subcategory to search for equipment.</p>
      </div>

      <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {selectedSubcategory ? 'No equipment found for the selected subcategory' : 'Select a subcategory to search for equipment'}
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">Found {data.length} equipment record{data.length !== 1 ? 's' : ''} for subcategory "{selectedSubcategory}"</p>
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

