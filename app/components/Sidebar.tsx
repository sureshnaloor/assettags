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
  { name: 'Fixed Assets', href: '/fixedasset', icon: Building },
  { name: 'Tools', href: '/tools', icon: Hammer },
  { name: 'Asset Search', href: '/search', icon: Search },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-t from-blue-300/40 via-indigo-100/40 to-blue-50/70 dark:from-slate-900/90 dark:via-slate-900/85 dark:to-slate-800/85 backdrop-blur-lg shadow-lg shadow-blue-200/15 dark:shadow-slate-900/25 md:block md:w-64 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col gap-2">
        <div className="flex-1 overflow-auto py-5">
          <nav className="grid items-start px-3 text-xs font-medium space-y-1.5">
            {navigation.map((item, idx) => {
              const isActive = pathname === item.href || 
                (pathname && item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    // Base (smaller than header)
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-all duration-300 border",
                    // Color sets by position
                    idx < 4
                      ? "bg-gradient-to-r from-slate-200/25 to-slate-300/25 text-slate-600 dark:text-slate-300 hover:from-slate-200/45 hover:to-slate-300/45 hover:shadow-slate-200/20 border-slate-200/25 dark:border-slate-600/25"
                      : idx >= navigation.length - 3
                      ? "bg-gradient-to-r from-slate-200/20 to-slate-300/20 text-slate-500 dark:text-slate-400 hover:from-slate-200/35 hover:to-slate-300/35 hover:shadow-slate-200/15 border-slate-200/20 dark:border-slate-600/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-gradient-to-r hover:from-slate-100/60 hover:to-slate-50/60 dark:hover:from-slate-700/60 dark:hover:to-slate-600/60 hover:shadow-sm hover:shadow-slate-200/30 dark:hover:shadow-slate-800/30 border-transparent hover:border-slate-200/30 dark:hover:border-slate-600/30",
                    // Active state overlays
                    isActive && (
                      idx < 4
                        ? "ring-1 ring-slate-300/40 dark:ring-slate-600/40 shadow-md"
                        : idx >= navigation.length - 3
                        ? "ring-1 ring-slate-300/30 dark:ring-slate-600/30 shadow-sm"
                        : "bg-gradient-to-r from-slate-200/70 to-slate-100/70 dark:from-slate-700/70 dark:to-slate-600/70 text-slate-700 dark:text-slate-200 shadow-sm shadow-slate-200/30 dark:shadow-slate-800/30 border-slate-200/40 dark:border-slate-600/40"
                    )
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  <span className="font-medium tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* Divider below last link */}
          <div className="mt-2 border-b border-blue-200/60 dark:border-slate-700/70 mx-3" />
        </div>
      </div>
    </div>
  );
}
