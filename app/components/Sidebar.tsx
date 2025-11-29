'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useEffect, useState } from 'react';
import {
  FileText,
} from 'lucide-react';

// Map of navigation sections to their sub-links
const subLinksMap: Record<string, Array<{ name: string; href: string }>> = {
  // dashboard: [
  //   { name: 'Dashboard-1', href: '#' },
  //   { name: 'Dashboard-2', href: '#' },
  //   { name: 'Dashboard-3', href: '#' },
  //   { name: 'Dashboard-4', href: '#' },
  // ],
  reports: [
    { name: 'Active Calibrations-1', href: '#' },
    { name: 'Active Calibrations-2', href: '#' },
    { name: 'Active Calibrations-3', href: '#' },
    { name: 'Active Calibrations-4', href: '#' },
  ],
  mme: [
    { name: 'MME', href: '#' },
    { name: 'Unidentified MME & LVA', href: '/mme/unidentified' },
    { name: 'Without Custodian', href: '/mme/without-custodian' },
    { name: 'Search by Serial Number', href: '/mme-search-by-serial-number' },
    { name: 'Search by Manufacturer', href: '/mme-search-by-manufacturer' },
    { name: 'Search by Model', href: '/mme-search-by-model' },
    { name: 'Search by Category', href: '/mme-search-by-category' },
    { name: 'Search by Subcategory', href: '/mme-search-by-subcategory' },
    { name: 'Search by Year of Acquisition', href: '/mme-search-by-year-of-acquisition' },
  ],
  assets: [
    { name: 'Assets', href: '#' },
    { name: 'Unidentified Assets', href: '/assets/unidentified' },
    { name: 'Without Custodian', href: '/fixedasset/without-custodian' },
    { name: 'Search by manufacturer', href: '/assets-search-by-manufacturer' },
    { name: 'Search by model', href: '/assets-search-by-model' },
    { name: 'Search by category', href: '/assets-search-by-category' },
    { name: 'Search by subcategory', href: '/assets-search-by-subcategory' },
    { name: 'Search by year of acquisition', href: '/assets-search-by-year-of-acquisition' },
  ],
  tools: [
    { name: 'Tools-1', href: '#' },
    { name: 'Tools-2', href: '#' },
    { name: 'Tools-3', href: '#' },
    { name: 'Tools-4', href: '#' },
  ],
  materials: [
    { name: 'List all returned materials', href: '/projectreturn-materials/list-all-returned-materials' },
    { name: 'Returned materials by project', href: '/projectreturn-materials/by-project' },
    { name: 'List of projectreturn-materials issued to wbs', href: '/projectreturn-materials/issues-by-wbs' },
    { name: 'List of all reco for disposal materials', href: '/projectreturn-materials/list-all-reco-for-disposal-materials' },
    { name: 'Under disposal materials', href: '/projectreturn-materials/under-disposal-materials' },
    { name: 'Future use', href: '#' },
  ],
  search: [
    { name: 'Search-1', href: '#' },
    { name: 'Search-2', href: '#' },
    { name: 'Search-3', href: '#' },
    { name: 'Search-4', href: '#' },
  ],
  employee: [
    { name: 'Employee-1', href: '#' },
    { name: 'Employee-2', href: '#' },
    { name: 'Employee-3', href: '#' },
    { name: 'Employee-4', href: '#' },
  ],
  ppe: [
    { name: 'PPE-1', href: '#' },
    { name: 'PPE-2', href: '#' },
    { name: 'PPE-3', href: '#' },
    { name: 'PPE-4', href: '#' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { activeSection } = useNavigation();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default or show error message
        }
      );
    }
  }, []);

  // Get sub-links for the active section
  const subLinks = activeSection ? subLinksMap[activeSection] || [] : [];

  return (
    <div className="hidden border-r border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40 md:block md:w-64 self-stretch h-full">
      <div className="flex h-full flex-col gap-3">
        <div className="flex-1 overflow-auto py-6">
          {activeSection && subLinks.length > 0 ? (
            <nav className="grid items-start px-3 text-[10px] font-semibold uppercase tracking-wider space-y-2">
              <div className="px-3 py-2 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-300/50 dark:border-slate-600/50 pb-2">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h2>
              </div>
              {subLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 border hover:scale-105",
                      "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80 dark:hover:from-slate-700/80 dark:hover:to-slate-600/80 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-800/40 border-transparent hover:border-slate-200/40 dark:hover:border-slate-600/40",
                      isActive && "bg-gradient-to-r from-slate-200/80 to-slate-100/80 dark:from-slate-700/80 dark:to-slate-600/80 text-slate-800 dark:text-slate-200 shadow-lg shadow-slate-200/50 dark:shadow-slate-800/50 border-slate-300/50 dark:border-slate-600/50"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="font-bold tracking-widest">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 text-xs">
              <p>Select a navigation item to see related links</p>
            </div>
          )}
        </div>

        {/* Footer with time and location */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/70 px-4 py-4 space-y-2">
          <div className="text-[10px] text-slate-600 dark:text-slate-400">
            <div className="font-semibold uppercase tracking-wider mb-1">Time</div>
            <div className="text-xs font-mono">{currentTime || 'Loading...'}</div>
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400">
            <div className="font-semibold uppercase tracking-wider mb-1">Location</div>
            {location.lat && location.lon ? (
              <div className="text-xs font-mono">
                <div>{location.lat.toFixed(6)}, {location.lon.toFixed(6)}</div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-400 dark:text-slate-600">
                Getting location...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
