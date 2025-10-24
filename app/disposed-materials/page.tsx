'use client';
import { useState, useEffect } from 'react';
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, Trash2, AlertTriangle, Calendar, User } from 'lucide-react';
import ResponsiveTanStackTable from '@/components/ui/responsive-tanstack-table';
import { DisposedMaterial } from '@/types/projectreturnmaterials';

export default function DisposedMaterialsPage() {
  const [data, setData] = useState<DisposedMaterial[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisposedMaterials();
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
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Material ID
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
          {row.getValue('materialid')}
        </span>
      ),
    },
    {
      accessorKey: 'materialCode',
      header: 'Material Code',
    },
    {
      accessorKey: 'materialDescription',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('materialDescription') as string;
        return (
          <div className="max-w-xs truncate" title={description}>
            {description}
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
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Disposed Quantity
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue('disposedQuantity') as number;
        return value.toLocaleString();
      }
    },
    {
      accessorKey: 'disposedValue',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Disposed Value
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue('disposedValue') as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value);
      }
    },
    {
      accessorKey: 'sourceProject',
      header: 'Source Project',
    },
    {
      accessorKey: 'sourceWBS',
      header: 'Source WBS',
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'disposedBy',
      header: 'Disposed By',
      cell: ({ row }) => {
        const disposedBy = row.getValue('disposedBy') as string;
        return (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{disposedBy}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'disposedAt',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Disposed Date
            <ArrowUpDown className="h-4 w-4" />
          </button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('disposedAt') as Date;
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-sm">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading disposed materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Disposed Materials
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Materials that have been disposed and moved to scrap status
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Disposed Materials
              </label>
              <input
                type="text"
                placeholder="Search materials..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
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
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Disposed Materials
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No materials have been disposed yet.
          </p>
        </div>
      )}
    </div>
  );
}
