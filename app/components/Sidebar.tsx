'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  Truck,
  Wrench,
  Users,
  Calendar,
  FileText,
  Settings,
  Building,
  Search,
  BarChart3,
  Hammer,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'MME', href: '/mme', icon: Wrench },
  { name: 'Assets', href: '/fixedasset', icon: Building },
  { name: 'Tools', href: '/tools', icon: Hammer },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40 md:block md:w-64 sticky top-18 h-[calc(100vh-4.5rem)]">
      <div className="flex h-full flex-col gap-3">
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-3 text-[10px] font-semibold uppercase tracking-wider space-y-2">
            {navigation.map((item, idx) => {
              const isActive = pathname === item.href || 
                (pathname && item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    // Base styling with improved typography
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 border hover:scale-105",
                    // Color sets by position with better contrast
                    idx < 4
                      ? "bg-gradient-to-r from-slate-100/80 to-slate-200/80 text-slate-800 dark:text-slate-100 hover:from-slate-200/90 hover:to-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border-slate-300/40 dark:border-slate-600/40"
                      : idx >= navigation.length - 3
                      ? "bg-gradient-to-r from-slate-50/60 to-slate-100/60 text-slate-700 dark:text-slate-200 hover:from-slate-100/80 hover:to-slate-200/80 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-800/40 border-slate-200/30 dark:border-slate-600/30"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80 dark:hover:from-slate-700/80 dark:hover:to-slate-600/80 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-800/40 border-transparent hover:border-slate-200/40 dark:hover:border-slate-600/40",
                    // Active state overlays with enhanced visibility
                    isActive && (
                      idx < 4
                        ? "ring-2 ring-slate-400/60 dark:ring-slate-500/60 shadow-xl shadow-slate-200/60 dark:shadow-slate-800/60 bg-gradient-to-r from-slate-200/90 to-slate-300/90 dark:from-slate-700/90 dark:to-slate-600/90 text-slate-900 dark:text-slate-100"
                        : idx >= navigation.length - 3
                        ? "ring-1 ring-slate-400/50 dark:ring-slate-500/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-800/50 bg-gradient-to-r from-slate-100/90 to-slate-200/90 dark:from-slate-700/90 dark:to-slate-600/90 text-slate-800 dark:text-slate-200"
                        : "bg-gradient-to-r from-slate-200/80 to-slate-100/80 dark:from-slate-700/80 dark:to-slate-600/80 text-slate-800 dark:text-slate-200 shadow-lg shadow-slate-200/50 dark:shadow-slate-800/50 border-slate-300/50 dark:border-slate-600/50"
                    )
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                  <span className="font-bold tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* Divider below last link */}
          <div className="mt-4 border-b border-slate-200/60 dark:border-slate-700/70 mx-4" />
        </div>
      </div>
    </div>
  );
}
