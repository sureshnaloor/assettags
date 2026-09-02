'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { isPublicRoute } from '@/lib/public-routes';
import LoginRequired from './LoginRequired';
import Loading from './Loading';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center">
        <Loading message="Checking access..." size="lg" />
      </div>
    );
  }

  if (!session) {
    return <LoginRequired />;
  }

  return <>{children}</>;
}
