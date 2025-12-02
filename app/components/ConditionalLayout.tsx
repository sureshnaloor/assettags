'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide Header and Footer on landing page and home page since they have their own navigation
  const shouldShowLayout = pathname !== '/landing' && pathname !== '/';

  return (
    <>
      {shouldShowLayout && <Header />}
      {children}
      {shouldShowLayout && <Footer />}
    </>
  );
}

