'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  OnChangeFn
} from '@tanstack/react-table';

interface ResponsiveTanStackTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  sorting?: SortingState;
  setSorting?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  setGlobalFilter?: OnChangeFn<string>;
  className?: string;
  getRowId?: (row: TData) => string;
}

function ResponsiveTanStackTable<TData>({
  data,
  columns,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  className,
  getRowId
}: ResponsiveTanStackTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    getRowId,
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-slate-700 dark:text-slate-300 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 data-[state=selected]:bg-muted",
                    index % 2 === 0 
                      ? "bg-white dark:bg-slate-900" 
                      : "bg-slate-50/30 dark:bg-slate-800/30"
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const columnId = cell.column.id;
                    const cellValue = cell.getValue();
                    
                    // Determine cell styling based on column type and content
                    const getCellStyling = () => {
                      // Asset Number - Bold, monospace font
                      if (columnId.includes('assetnumber') || columnId.includes('number')) {
                        return "font-mono font-bold text-slate-900 dark:text-slate-100 text-sm";
                      }
                      // Description - Italic, slightly larger
                      if (columnId.includes('description') || columnId.includes('name')) {
                        return "font-medium italic text-slate-700 dark:text-slate-300 text-sm";
                      }
                      // Status - Colored badge style
                      if (columnId.includes('status') || columnId.includes('condition')) {
                        return "font-semibold text-xs uppercase tracking-wide";
                      }
                      // Category/Subcategory - Light weight, smaller
                      if (columnId.includes('category') || columnId.includes('subcategory')) {
                        return "font-light text-slate-600 dark:text-slate-400 text-xs";
                      }
                      // Value/Price - Bold, monospace, colored
                      if (columnId.includes('value') || columnId.includes('price') || columnId.includes('cost')) {
                        return "font-mono font-bold text-green-700 dark:text-green-400 text-sm";
                      }
                      // Date - Light weight, smaller
                      if (columnId.includes('date') || columnId.includes('time')) {
                        return "font-light text-slate-500 dark:text-slate-500 text-xs";
                      }
                      // Manufacturer/Model - Medium weight
                      if (columnId.includes('manufacturer') || columnId.includes('model') || columnId.includes('brand')) {
                        return "font-medium text-slate-700 dark:text-slate-300 text-sm";
                      }
                      // Serial Number - Monospace, smaller
                      if (columnId.includes('serial') || columnId.includes('id')) {
                        return "font-mono font-medium text-slate-600 dark:text-slate-400 text-xs";
                      }
                      // Location - Italic, smaller
                      if (columnId.includes('location') || columnId.includes('place')) {
                        return "font-light italic text-slate-500 dark:text-slate-500 text-xs";
                      }
                      // Default styling
                      return "font-normal text-slate-700 dark:text-slate-300 text-sm";
                    };

                    return (
                      <td
                        key={cell.id}
                        className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        <div className={getCellStyling()}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows.map((row, index) => (
          <div
            key={row.id}
            className={cn(
              "border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md",
              index % 2 === 0 
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
            )}
          >
            <div className="space-y-3">
              {row.getVisibleCells().map((cell, index) => {
                const column = cell.column;
                const columnDef = column.columnDef;
                const columnId = column.id;
                
                // Get the header from the table's header groups
                const headerGroup = table.getHeaderGroups()[0];
                const header = headerGroup?.headers.find(h => h.column.id === column.id);
                const headerContent = header ? flexRender(header.column.columnDef.header, header.getContext()) : (typeof columnDef.header === 'string' ? columnDef.header : '');
                
                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center",
                      index === 0 && "border-b pb-2 mb-2"
                    )}
                  >
                    <div className="text-sm font-medium text-muted-foreground sm:w-1/3 sm:pr-4">
                      {headerContent}:
                    </div>
                    <div className={cn(
                      "text-sm sm:w-2/3 sm:pl-4",
                      // Apply similar styling logic for mobile cards
                      columnId.includes('assetnumber') || columnId.includes('number') 
                        ? "font-mono font-bold text-slate-900 dark:text-slate-100" 
                        : columnId.includes('description') || columnId.includes('name')
                        ? "font-medium italic text-slate-700 dark:text-slate-300"
                        : columnId.includes('status') || columnId.includes('condition')
                        ? "font-semibold text-xs uppercase tracking-wide"
                        : columnId.includes('category') || columnId.includes('subcategory')
                        ? "font-light text-slate-600 dark:text-slate-400 text-xs"
                        : columnId.includes('value') || columnId.includes('price') || columnId.includes('cost')
                        ? "font-mono font-bold text-green-700 dark:text-green-400"
                        : columnId.includes('date') || columnId.includes('time')
                        ? "font-light text-slate-500 dark:text-slate-500 text-xs"
                        : columnId.includes('manufacturer') || columnId.includes('model') || columnId.includes('brand')
                        ? "font-medium text-slate-700 dark:text-slate-300"
                        : columnId.includes('serial') || columnId.includes('id')
                        ? "font-mono font-medium text-slate-600 dark:text-slate-400 text-xs"
                        : columnId.includes('location') || columnId.includes('place')
                        ? "font-light italic text-slate-500 dark:text-slate-500 text-xs"
                        : "font-normal text-slate-700 dark:text-slate-300"
                    )}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveTanStackTable;
