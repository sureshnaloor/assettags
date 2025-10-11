'use client';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = true 
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-sky-600/80 dark:bg-sky-700/80 hover:bg-sky-600/90 dark:hover:bg-sky-700/90 rounded-lg transition-colors"
      >
        <h2 className="text-sm font-semibold text-emerald-200 dark:text-emerald-300">{title}</h2>
        <ChevronDownIcon 
          className={`h-5 w-5 text-emerald-200 dark:text-emerald-300 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-3 flex justify-center items-center">
          {children}
        </div>
      </div>
    </div>
  );
} 