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
                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="border rounded-lg p-4 bg-card shadow-sm"
          >
            <div className="space-y-3">
              {row.getVisibleCells().map((cell, index) => {
                const column = cell.column;
                const columnDef = column.columnDef;
                
                // Get the header from the table's header groups
                const headerGroup = table.getHeaderGroups()[0];
                const header = headerGroup?.headers.find(h => h.column.id === column.id);
                const headerContent = header ? flexRender(header.column.columnDef.header, header.getContext()) : columnDef.header;
                
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
                    <div className="text-sm sm:w-2/3 sm:pl-4">
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
