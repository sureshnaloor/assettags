'use client';

import Image from 'next/image';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-8">
              <Image
                src="/images/logo.jpg"
                alt="JAL Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div className="text-sm sm:text-base font-semibold italic uppercase 
                          text-slate-800 dark:text-zinc-100 tracking-wider
                          transform hover:scale-105 transition-transform duration-200">
              Asset Tags
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            <Link 
              href="/mme" 
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              MME
            </Link>
            <Link 
              href="/fixedasset" 
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Fixed Assets
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          {/* Auth Buttons */}
          {status === 'loading' ? (
            <div className="animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          ) : !session ? (
            <button
              onClick={() => signIn()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="relative h-8 w-8 rounded-full bg-gray-200">
                  {session.user?.image ? (
                    <Image
                      src={session.user?.image || ''}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {session.user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-slate-800 dark:ring-slate-700">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                    {session.user?.email}
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() => signOut()}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}