'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const tabs = [
  { href: '/fixedasset/transport-assets', label: 'Assets', match: (p: string) =>
      p === '/fixedasset/transport-assets' ||
      (p.startsWith('/fixedasset/transport-assets/') && !p.includes('/masters/')) },
  {
    href: '/fixedasset/transport-assets/masters/preventive',
    label: 'Preventive types',
    match: (p: string) => p.startsWith('/fixedasset/transport-assets/masters/preventive')
  },
  {
    href: '/fixedasset/transport-assets/masters/breakdown',
    label: 'Breakdown types',
    match: (p: string) => p.startsWith('/fixedasset/transport-assets/masters/breakdown')
  }
];

export default function TransportAssetsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  return (
    <div>
      <div className="border-b border-white/10 bg-slate-900/80 px-4 py-3 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
