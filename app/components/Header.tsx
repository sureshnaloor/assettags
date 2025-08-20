'use client';

import Image from 'next/image';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { 
  HomeIcon, 
  ChartBarIcon, 
  WrenchScrewdriverIcon, 
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileReportsOpen, setIsMobileReportsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'MME', href: '/mme', icon: WrenchScrewdriverIcon },
    { name: 'Fixed Assets', href: '/fixedasset', icon: BuildingOfficeIcon },
  ];

  const reportsMenu = [
    { name: 'Active Calibrations', href: '/reports/active-calibrations' },
    { name: 'Expired Calibrations', href: '/reports/expired-calibrations' },
    { name: 'Project Equipment', href: '/reports/project-equipment' },
    { name: 'User Equipment', href: '/reports/user-equipment' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-36 h-20">
              <Image
                src="/images/logosmarttag.png"
                alt="SmartTags Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          
          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowReportsMenu(true)}
              onMouseLeave={() => setShowReportsMenu(false)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <DocumentChartBarIcon className="h-5 w-5" />
              <span>Reports</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {showReportsMenu && (
              <div
                onMouseEnter={() => setShowReportsMenu(true)}
                onMouseLeave={() => setShowReportsMenu(false)}
                className="absolute left-0 top-full mt-1 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-slate-700"
              >
                {reportsMenu.map((report) => (
                  <Link
                    key={report.name}
                    href={report.href}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>{report.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side - Theme switcher and auth */}
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          
          {/* Auth Buttons */}
          {status === 'loading' ? (
            <div className="animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          ) : !session ? (
            <button
              onClick={() => signIn()}
              className="hidden sm:flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
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
                <div className="absolute right-0 top-full mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-slate-800 dark:ring-slate-700">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700">
                    {session.user?.email}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/auth/change-password"
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <KeyIcon className="h-4 w-4" />
                      <span>Change Password</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile Reports Section */}
            <div>
              <button
                onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <DocumentChartBarIcon className="h-5 w-5" />
                  <span>Reports</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileReportsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {reportsMenu.map((report) => (
                    <Link
                      key={report.name}
                      href={report.href}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileReportsOpen(false);
                      }}
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      <span>{report.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    signIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}