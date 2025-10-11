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
              <tr className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                      column.className
                    )}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort(column.key)}
                        className="flex items-center gap-2 h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
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
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {item[column.key]}
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
        {data.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-card shadow-sm"
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
                  <div className="text-sm sm:w-2/3 sm:pl-4">
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
