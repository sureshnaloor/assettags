'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { isMarketingRoute } from '@/lib/design-tokens';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/** Single-segment routes under /fixedasset that are app pages (not asset detail) — keep main sidebar visible. */
const FIXED_ASSET_LIST_ROUTES = new Set([
  'category',
  'subcategory',
  'manufacturer',
  'without-custodian',
  'search-by-location',
  'transport-assets',
  'portable-assets',
  'software-assets',
]);

function isFixedAssetAssetDetailPath(pathname: string): boolean {
  // Software asset detail: full-width page like /fixedasset/[id]
  if (/^\/fixedasset\/software-assets\/.+/.test(pathname)) {
    return true;
  }
  // Transport asset detail (not master list tabs under /masters/)
  if (/^\/fixedasset\/transport-assets\/.+/.test(pathname)) {
    if (/^\/fixedasset\/transport-assets\/masters\//.test(pathname)) {
      return false;
    }
    return true;
  }
  if (/^\/fixedasset\/portable-assets\/.+/.test(pathname)) {
    return true;
  }
  const m = pathname.match(/^\/fixedasset\/([^/]+)$/);
  if (!m) return false;
  return !FIXED_ASSET_LIST_ROUTES.has(m[1]);
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on landing page, dashboard, and asset detail pages
  const shouldShowSidebar = pathname && 
                           !isMarketingRoute(pathname) &&
                           pathname !== '/dashboard' &&
                           !pathname.match(/^\/asset\/[^\/]+$/) && 
                           !isFixedAssetAssetDetailPath(pathname) &&
                           !pathname.match(/^\/tools\/[^\/]+$/);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="grid flex-1 md:grid-cols-[280px_1fr] items-stretch">
        <Sidebar />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
