'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: any) => void;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  sortField,
  sortOrder,
  onSort,
  className
}) => {
  const toggleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "h-12 px-4 text-left align-middle font-medium text-slate-700 dark:text-slate-300 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                      column.className
                    )}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort(column.key)}
                        className="flex items-center gap-2 h-auto p-0 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        {column.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 data-[state=selected]:bg-muted",
                    index % 2 === 0 
                      ? "bg-white dark:bg-slate-900" 
                      : "bg-slate-50/30 dark:bg-slate-800/30"
                  )}
                >
                  {columns.map((column) => {
                    const columnId = column.key;
                    const cellValue = item[column.key];
                    
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
                        key={column.key}
                        className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        <div className={getCellStyling()}>
                          {cellValue}
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
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              "border rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md",
              index % 2 === 0 
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
            )}
          >
            <div className="space-y-3">
              {columns.map((column, colIndex) => (
                <div
                  key={column.key}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center",
                    colIndex === 0 && "border-b pb-2 mb-2"
                  )}
                >
                  <div className="text-sm font-medium text-muted-foreground sm:w-1/3 sm:pr-4">
                    {column.label}:
                  </div>
                  <div className={cn(
                    "text-sm sm:w-2/3 sm:pl-4",
                    // Apply similar styling logic for mobile cards
                    column.key.includes('assetnumber') || column.key.includes('number') 
                      ? "font-mono font-bold text-slate-900 dark:text-slate-100" 
                      : column.key.includes('description') || column.key.includes('name')
                      ? "font-medium italic text-slate-700 dark:text-slate-300"
                      : column.key.includes('status') || column.key.includes('condition')
                      ? "font-semibold text-xs uppercase tracking-wide"
                      : column.key.includes('category') || column.key.includes('subcategory')
                      ? "font-light text-slate-600 dark:text-slate-400 text-xs"
                      : column.key.includes('value') || column.key.includes('price') || column.key.includes('cost')
                      ? "font-mono font-bold text-green-700 dark:text-green-400"
                      : column.key.includes('date') || column.key.includes('time')
                      ? "font-light text-slate-500 dark:text-slate-500 text-xs"
                      : column.key.includes('manufacturer') || column.key.includes('model') || column.key.includes('brand')
                      ? "font-medium text-slate-700 dark:text-slate-300"
                      : column.key.includes('serial') || column.key.includes('id')
                      ? "font-mono font-medium text-slate-600 dark:text-slate-400 text-xs"
                      : column.key.includes('location') || column.key.includes('place')
                      ? "font-light italic text-slate-500 dark:text-slate-500 text-xs"
                      : "font-normal text-slate-700 dark:text-slate-300"
                  )}>
                    {item[column.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;
