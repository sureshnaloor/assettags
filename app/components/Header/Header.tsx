'use client';

import Link from 'next/link';
import AuthButtons from './AuthButtons';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Your Logo
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden space-x-8 md:flex">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
            >
              Home
            </Link>
            {/* Add more navigation links as needed */}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
} 