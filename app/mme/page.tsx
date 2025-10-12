'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

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
  acquireddate: Date;
  assetmanufacturer: string;
  assetmodel: string;
  assetserialnumber: string;
}

export default function MMEPage() {
  const [data, setData] = useState<Equipment[]>([]);
  const [assetNumberSearch, setAssetNumberSearch] = useState('');
  const [assetNameSearch, setAssetNameSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loading, setLoading] = useState(false);  // Changed to false initially

  const searchEquipment = async (assetNumber: string, assetName: string) => {
    // Only search if input is at least 2 characters
    if ((!assetNumber?.trim() || assetNumber.trim().length < 2) && 
        (!assetName?.trim() || assetName.trim().length < 2)) {
      setData([]);
      return;
    }
    // Only proceed if at least one search parameter is filled
    if (!assetNumber?.trim() && !assetName?.trim()) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (assetNumber?.trim()) params.append('assetNumber', assetNumber);
      if (assetName?.trim()) params.append('assetName', assetName);

      const response = await fetch(`/api/assets?${params.toString()}`); // Changed from fixedassets to assets
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchEquipment(assetNumberSearch, assetNameSearch);
    }, 500); // Increased from 300ms to 500ms

    return () => clearTimeout(timer);
  }, [assetNumberSearch, assetNameSearch]);

  // Remove these as they're not needed anymore
  // const [globalFilter, setGlobalFilter] = useState('');
  // Remove initial useEffect and fetchEquipment function
  
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
          className="text-blue-400 hover:text-blue-300"
        >
          {row.original.assetnumber}
        </Link>
      ),
    },
    {
      accessorKey: 'assetdescription',
      header: 'Description',
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('assetdescription')}</div>,
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
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-2xl font-semibold">MME Equipment</h1>
      </div>
      
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          value={assetNumberSearch}
          onChange={(e) => setAssetNumberSearch(e.target.value)}
          placeholder="Search by asset number..."
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={assetNameSearch}
          onChange={(e) => setAssetNameSearch(e.target.value)}
          placeholder="Search by asset description..."
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Enter search criteria to view assets
          </div>
        ) : (
          <ResponsiveTanStackTable
            data={data}
            columns={columns}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            getRowId={(row) => row._id}
          />
        )}
      </div>
      
    </div>
  );
}