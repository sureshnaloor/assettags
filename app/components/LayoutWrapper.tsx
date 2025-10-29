'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on landing page, dashboard, and asset detail pages
  const shouldShowSidebar = pathname && 
                           pathname !== '/' &&
                           pathname !== '/dashboard' &&
                           !pathname.match(/^\/asset\/[^\/]+$/) && 
                           !pathname.match(/^\/fixedasset\/[^\/]+$/) &&
                           !pathname.match(/^\/tools\/[^\/]+$/);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="grid flex-1 md:grid-cols-[256px_1fr]">
        <Sidebar />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
