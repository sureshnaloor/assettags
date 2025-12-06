'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useEffect, useState } from 'react';
import {
  FileText,
} from 'lucide-react';
import { useAppTheme } from '@/app/contexts/ThemeContext';

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
  const { theme } = useAppTheme();
  const pathname = usePathname();
  const { activeSection } = useNavigation();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  });

  // Theme-based styling function
  const getSidebarStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          sidebarBg: 'bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332] backdrop-blur-xl',
          sidebarBorder: 'border-r border-white/10',
          sectionTitle: 'text-white border-b border-white/20',
          linkText: 'text-white/80 hover:text-white',
          linkHover: 'hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md hover:shadow-black/20 hover:border-white/20',
          linkActive: 'bg-white/10 backdrop-blur-md text-white shadow-lg shadow-black/30 border-white/20',
          linkIcon: 'text-teal-400',
          emptyText: 'text-white/60',
          footerBg: 'bg-white/5 backdrop-blur-md border-t border-white/10',
          footerLabel: 'text-white/80',
          footerValue: 'text-white',
          footerValueSecondary: 'text-white/60'
        };
      case 'light':
        return {
          sidebarBg: 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100',
          sidebarBorder: 'border-r-2 border-blue-200',
          sectionTitle: 'text-gray-900 border-b-2 border-blue-200',
          linkText: 'text-gray-700 hover:text-gray-900',
          linkHover: 'hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/20 hover:border-blue-200',
          linkActive: 'bg-blue-100 text-gray-900 shadow-lg shadow-blue-200/30 border-2 border-blue-300',
          linkIcon: 'text-blue-600',
          emptyText: 'text-gray-500',
          footerBg: 'bg-blue-50 border-t-2 border-blue-200',
          footerLabel: 'text-gray-700',
          footerValue: 'text-gray-900',
          footerValueSecondary: 'text-gray-600'
        };
      default: // dark theme
        return {
          sidebarBg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
          sidebarBorder: 'border-r border-slate-700',
          sectionTitle: 'text-slate-100 border-b border-slate-700',
          linkText: 'text-slate-300 hover:text-slate-100',
          linkHover: 'hover:bg-slate-800 hover:shadow-md hover:shadow-slate-900/20 hover:border-slate-600',
          linkActive: 'bg-slate-800 text-slate-100 shadow-lg shadow-slate-900/30 border border-slate-600',
          linkIcon: 'text-teal-400',
          emptyText: 'text-slate-400',
          footerBg: 'bg-slate-800/50 border-t border-slate-700',
          footerLabel: 'text-slate-300',
          footerValue: 'text-slate-100',
          footerValueSecondary: 'text-slate-400'
        };
    }
  };

  const sidebarStyles = getSidebarStyles();

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
    <div className={`hidden ${sidebarStyles.sidebarBorder} ${sidebarStyles.sidebarBg} shadow-xl md:block md:w-64 self-stretch h-full`}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex-1 overflow-auto py-6">
          {activeSection && subLinks.length > 0 ? (
            <nav className="grid items-start px-3 text-[10px] font-semibold uppercase tracking-wider space-y-2">
              <div className="px-3 py-2 mb-4">
                <h2 className={`text-xs font-bold uppercase tracking-wider ${sidebarStyles.sectionTitle} pb-2`}>
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
                      sidebarStyles.linkText,
                      sidebarStyles.linkHover,
                      "border-transparent",
                      isActive && sidebarStyles.linkActive
                    )}
                  >
                    <FileText className={`h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 ${sidebarStyles.linkIcon}`} />
                    <span className="font-bold tracking-widest">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className={`flex items-center justify-center h-full ${sidebarStyles.emptyText} text-xs px-4`}>
              <p className="text-center">Select a navigation item to see related links</p>
            </div>
          )}
        </div>

        {/* Footer with time and location */}
        <div className={`${sidebarStyles.footerBg} px-4 py-4 space-y-2`}>
          <div className={`text-[10px] ${sidebarStyles.footerLabel}`}>
            <div className="font-semibold uppercase tracking-wider mb-1">Time</div>
            <div className={`text-xs font-mono ${sidebarStyles.footerValue}`}>{currentTime || 'Loading...'}</div>
          </div>
          <div className={`text-[10px] ${sidebarStyles.footerLabel}`}>
            <div className="font-semibold uppercase tracking-wider mb-1">Location</div>
            {location.lat && location.lon ? (
              <div className={`text-xs font-mono ${sidebarStyles.footerValue}`}>
                <div>{location.lat.toFixed(6)}, {location.lon.toFixed(6)}</div>
              </div>
            ) : (
              <div className={`text-xs font-mono ${sidebarStyles.footerValueSecondary}`}>
                Getting location...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
