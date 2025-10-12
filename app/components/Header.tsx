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
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showPPEMenu, setShowPPEMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileReportsOpen, setIsMobileReportsOpen] = useState(false);
  const [isMobilePPEOpen, setIsMobilePPEOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'MME', href: '/mme', icon: WrenchScrewdriverIcon },
    { name: 'Fixed Assets', href: '/fixedasset', icon: BuildingOfficeIcon },
    { name: 'Asset Search', href: '/search', icon: ChartBarIcon },
    { name: 'Employee Management', href: '/employee-management', icon: UserGroupIcon },
  ];

  const reportsMenu = [
    { name: 'Active Calibrations', href: '/reports/active-calibrations' },
    { name: 'Expired Calibrations', href: '/reports/expired-calibrations' },
    { name: 'Project Equipment', href: '/reports/project-equipment' },
    { name: 'User Equipment', href: '/reports/user-equipment' },
    { name: 'Warehouse Equipment', href: '/reports/warehouse-equipment' },
  ];

      const ppeMenu = [
        { name: 'PPE Dashboard', href: '/ppe-dashboard', icon: ShieldCheckIcon },
        { name: 'PPE Master', href: '/ppe-master', icon: ClipboardDocumentListIcon },
        { name: 'Issue Records', href: '/ppe-issue-records', icon: ClipboardDocumentCheckIcon },
        { name: 'Bulk Issues', href: '/ppe-bulk-issues', icon: DocumentChartBarIcon },
        { name: 'Stock Management', href: '/ppe-stock', icon: ArchiveBoxIcon },
        { name: 'Due for Reissue', href: '/ppe-due-for-reissue', icon: ExclamationTriangleIcon },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-32 h-12">
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
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-sm font-light"
            >
              <item.icon className="h-4 w-4" />
              <span className="font-light">{item.name}</span>
            </Link>
          ))}
          
          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowReportsMenu(true)}
              onMouseLeave={() => setShowReportsMenu(false)}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-sm font-light"
            >
              <DocumentChartBarIcon className="h-4 w-4" />
              <span className="font-light">Reports</span>
              <ChevronDownIcon className="h-3 w-3" />
            </button>

            {showReportsMenu && (
              <div
                onMouseEnter={() => setShowReportsMenu(true)}
                onMouseLeave={() => setShowReportsMenu(false)}
                className="absolute left-0 top-full mt-1 w-56 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-md py-2 shadow-xl ring-1 ring-black/5 dark:ring-slate-700/50"
              >
                {reportsMenu.map((report) => (
                  <Link
                    key={report.name}
                    href={report.href}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-slate-700/80 transition-all duration-200 font-light"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>{report.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* PPE Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowPPEMenu(true)}
              onMouseLeave={() => setShowPPEMenu(false)}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-sm font-light"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              <span className="font-light">PPE</span>
              <ChevronDownIcon className="h-3 w-3" />
            </button>

            {showPPEMenu && (
              <div
                onMouseEnter={() => setShowPPEMenu(true)}
                onMouseLeave={() => setShowPPEMenu(false)}
                className="absolute left-0 top-full mt-1 w-56 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-md py-2 shadow-xl ring-1 ring-black/5 dark:ring-slate-700/50"
              >
                {ppeMenu.map((ppe) => (
                  <Link
                    key={ppe.name}
                    href={ppe.href}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-slate-700/80 transition-all duration-200 font-light"
                  >
                    <ppe.icon className="h-4 w-4" />
                    <span>{ppe.name}</span>
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
              className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-light text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
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
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-md py-2 shadow-xl ring-1 ring-black/5 z-50 dark:ring-slate-700/50">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100/50 dark:border-slate-700/50 font-light">
                    {session.user?.email}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/auth/change-password"
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50/80 dark:text-gray-200 dark:hover:bg-slate-700/80 transition-all duration-200 font-light"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <KeyIcon className="h-4 w-4" />
                      <span>Change Password</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50/80 dark:text-gray-200 dark:hover:bg-slate-700/80 transition-all duration-200 font-light"
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
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
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
        <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
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
                className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
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
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 font-light"
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

            {/* Mobile PPE Section */}
            <div>
              <button
                onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>PPE</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobilePPEOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {ppeMenu.map((ppe) => (
                    <Link
                      key={ppe.name}
                      href={ppe.href}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 font-light"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobilePPEOpen(false);
                      }}
                    >
                      <ppe.icon className="h-4 w-4" />
                      <span>{ppe.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <button
                  onClick={() => {
                    signIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
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