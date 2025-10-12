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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'MME', href: '/mme', icon: Wrench },
  { name: 'Fixed Assets', href: '/fixedasset', icon: Building },
  { name: 'Asset Search', href: '/search', icon: Search },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm md:block md:w-64 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col gap-2">
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-3 text-sm font-medium space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (pathname && item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50",
                    isActive && "bg-slate-200/80 dark:bg-slate-700/50 text-slate-900 dark:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-light">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
