'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function LoginRequired() {
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const isLight = theme === 'light';
  const signInHref = `/auth/signin?from=${encodeURIComponent(pathname || '/')}`;

  return (
    <div
      className={cn(
        'flex flex-1 min-h-[70vh] items-center justify-center px-4 py-16',
        isLight
          ? 'bg-[#F1F5F9]'
          : 'bg-gradient-to-br from-primary-dark via-primary-navy to-primary-slate'
      )}
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl border p-8 text-center shadow-lg sm:p-10',
          isLight
            ? 'border-blue-200 bg-white'
            : 'border-primary-light/50 bg-primary-navy/80 backdrop-blur-xl'
        )}
      >
        <div
          className={cn(
            'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full',
            isLight ? 'bg-blue-50' : 'bg-accent-teal/10'
          )}
        >
          <LockClosedIcon
            className={cn('h-8 w-8', isLight ? 'text-blue-600' : 'text-accent-teal')}
            aria-hidden
          />
        </div>

        <h1
          className={cn(
            'text-2xl font-bold tracking-tight sm:text-3xl',
            isLight ? 'text-gray-900' : 'text-text-primary'
          )}
        >
          Available to logged-in users only
        </h1>
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed sm:text-base',
            isLight ? 'text-gray-600' : 'text-text-secondary'
          )}
        >
          This page is restricted. Sign in to view dashboards, reports, asset lists,
          and other operational information. Public asset tags still show basic details;
          price-sensitive fields stay hidden until you sign in.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={signInHref}
            className={cn(
              'inline-flex w-full items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors sm:w-auto',
              isLight
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-cta-gradient shadow-glow-orange hover:brightness-110'
            )}
          >
            Sign in
          </Link>
          <Link
            href="/"
            className={cn(
              'inline-flex w-full items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors sm:w-auto',
              isLight
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-text-secondary hover:bg-primary-slate hover:text-text-primary'
            )}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
