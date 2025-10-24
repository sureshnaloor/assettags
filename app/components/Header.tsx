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
  ArchiveBoxIcon,
  TruckIcon,
  CogIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showPPEMenu, setShowPPEMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showProjectIssuedMenu, setShowProjectIssuedMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileReportsOpen, setIsMobileReportsOpen] = useState(false);
  const [isMobilePPEOpen, setIsMobilePPEOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isMobileProjectIssuedOpen, setIsMobileProjectIssuedOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'MME', href: '/mme', icon: WrenchScrewdriverIcon },
    { name: 'Assets', href: '/fixedasset', icon: BuildingOfficeIcon },
    { name: 'Search', href: '/search', icon: ChartBarIcon },
    { name: 'Employee', href: '/employee-management', icon: UserGroupIcon },
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
        { name: 'Receipts', href: '/ppe-receipts', icon: TruckIcon },
        { name: 'Stock Management', href: '/ppe-stock', icon: ArchiveBoxIcon },
        { name: 'Due for Reissue', href: '/ppe-due-for-reissue', icon: ExclamationTriangleIcon },
        { name: 'Issues (Date Range)', href: '/ppe-issues', icon: ClipboardDocumentIcon },
        { name: 'Issues by Employee', href: '/ppe-issues-employee', icon: UserIcon },
      ];

      const toolsMenu = [
        { name: 'Tools Management', href: '/tools', icon: CogIcon },
        { name: 'Tools Reports', href: '/tools/reports', icon: ClipboardDocumentIcon },
      ];

      const projectIssuedMenu = [
        { name: 'Project Issued Materials', href: '/projectissued-materials', icon: CubeIcon },
        { name: 'Project Return Materials', href: '/projectreturn-materials', icon: CubeIcon },
        { name: 'Disposed Materials', href: '/disposed-materials', icon: ExclamationTriangleIcon },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40">
      <div className="container mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative w-48 h-12 transition-transform duration-300 group-hover:scale-105 bg-blue-100 dark:bg-blue-900 rounded-lg border-2 border-blue-300 dark:border-blue-600 pr-4">
              <Image
                src="/images/smarttags.jpg"
                alt="AssetTags Logo"
                fill
                className="object-contain drop-shadow-md filter brightness-110"
                priority
              />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 dark:from-slate-400 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105" 
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.1)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: '600',
                    letterSpacing: '0.05em'
                  }}>
                Smart Tags
              </h1>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navigation.map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border ${
                idx < 4
                  ? 'bg-gradient-to-r from-slate-100/80 to-slate-200/80 text-slate-800 dark:text-slate-100 hover:from-slate-200/90 hover:to-slate-300/90 border-slate-300/40 dark:border-slate-600/40 hover:scale-105'
                  : 'bg-gradient-to-r from-slate-50/60 to-slate-100/60 text-slate-700 dark:text-slate-200 hover:from-slate-100/80 hover:to-slate-200/80 border-slate-200/30 dark:border-slate-600/30 hover:scale-105'
              }`}
            >
              <item.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="font-bold tracking-widest">{item.name}</span>
            </Link>
          ))}
          
          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowReportsMenu(true)}
              onMouseLeave={() => setShowReportsMenu(false)}
              className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-slate-100/70 to-slate-200/70 text-slate-700 dark:text-slate-200 hover:from-slate-200/90 hover:to-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-slate-300/40 dark:border-slate-600/40 hover:scale-105"
            >
              <DocumentChartBarIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="font-bold tracking-widest">Reports</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showReportsMenu && (
              <div
                onMouseEnter={() => setShowReportsMenu(true)}
                onMouseLeave={() => setShowReportsMenu(false)}
                className="absolute left-0 top-full mt-3 w-72 rounded-2xl z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl backdrop-saturate-150 py-4 shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/50 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50"
              >
                {reportsMenu.map((report) => (
                  <Link
                    key={report.name}
                    href={report.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                  >
                    <ChartBarIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="font-bold tracking-widest">{report.name}</span>
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
              className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-slate-100/70 to-slate-200/70 text-slate-700 dark:text-slate-200 hover:from-slate-200/90 hover:to-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-slate-300/40 dark:border-slate-600/40 hover:scale-105"
            >
              <ShieldCheckIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="font-bold tracking-widest">PPE</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showPPEMenu && (
              <div
                onMouseEnter={() => setShowPPEMenu(true)}
                onMouseLeave={() => setShowPPEMenu(false)}
                className="absolute left-0 top-full mt-3 w-72 rounded-2xl z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl backdrop-saturate-150 py-4 shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/50 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50"
              >
                {ppeMenu.map((ppe) => (
                  <Link
                    key={ppe.name}
                    href={ppe.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                  >
                    <ppe.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="font-bold tracking-widest">{ppe.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowToolsMenu(true)}
              onMouseLeave={() => setShowToolsMenu(false)}
              className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-slate-100/70 to-slate-200/70 text-slate-700 dark:text-slate-200 hover:from-slate-200/90 hover:to-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-slate-300/40 dark:border-slate-600/40 hover:scale-105"
            >
              <CogIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="font-bold tracking-widest">Tools</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showToolsMenu && (
              <div
                onMouseEnter={() => setShowToolsMenu(true)}
                onMouseLeave={() => setShowToolsMenu(false)}
                className="absolute left-0 top-full mt-3 w-72 rounded-2xl z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl backdrop-saturate-150 py-4 shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/50 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50"
              >
                {toolsMenu.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                  >
                    <tool.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="font-bold tracking-widest">{tool.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Project Issued Materials Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowProjectIssuedMenu(true)}
              onMouseLeave={() => setShowProjectIssuedMenu(false)}
              className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-slate-100/70 to-slate-200/70 text-slate-700 dark:text-slate-200 hover:from-slate-200/90 hover:to-slate-300/90 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-slate-300/40 dark:border-slate-600/40 hover:scale-105"
            >
              <CubeIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="font-bold tracking-widest">Materials</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showProjectIssuedMenu && (
              <div
                onMouseEnter={() => setShowProjectIssuedMenu(true)}
                onMouseLeave={() => setShowProjectIssuedMenu(false)}
                className="absolute left-0 top-full mt-3 w-72 rounded-2xl z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl backdrop-saturate-150 py-4 shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/50 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50"
              >
                {projectIssuedMenu.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                  >
                    <item.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="font-bold tracking-widest">{item.name}</span>
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
              className="hidden sm:flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 border border-blue-500/20 hover:border-blue-400/30 hover:scale-105"
            >
              <UserIcon className="h-3.5 w-3.5 transition-transform duration-300 hover:scale-125 hover:rotate-6" />
              <span className="font-bold tracking-widest">Sign In</span>
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
                <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-gradient-to-br from-white/98 to-slate-50/98 dark:from-slate-800/98 dark:to-slate-700/98 backdrop-blur-2xl py-4 shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/50 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50 z-50">
                  <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-600/50">
                    {session.user?.email}
                  </div>
                  <div className="py-2">
                    <Link
                      href="/auth/change-password"
                      className="group flex items-center space-x-3 w-full px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <KeyIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                      <span className="font-bold tracking-widest">Change Password</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="group flex items-center space-x-3 w-full px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                    >
                      <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                      <span className="font-bold tracking-widest">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:scale-105"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5 transition-transform duration-300 rotate-180" />
            ) : (
              <Bars3Icon className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white/98 to-slate-50/98 dark:from-slate-900/98 dark:to-slate-800/98 backdrop-blur-xl shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40">
          <div className="px-6 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                <span className="font-bold tracking-widest">{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile Reports Section */}
            <div>
              <button
                onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <DocumentChartBarIcon className="h-4 w-4" />
                  <span className="font-bold tracking-widest">Reports</span>
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileReportsOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {reportsMenu.map((report) => (
                    <Link
                      key={report.name}
                      href={report.href}
                      className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileReportsOpen(false);
                      }}
                    >
                      <ChartBarIcon className="h-3.5 w-3.5" />
                      <span className="font-bold tracking-widest">{report.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile PPE Section */}
            <div>
              <button
                onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="font-bold tracking-widest">PPE</span>
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobilePPEOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {ppeMenu.map((ppe) => (
                    <Link
                      key={ppe.name}
                      href={ppe.href}
                      className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobilePPEOpen(false);
                      }}
                    >
                      <ppe.icon className="h-3.5 w-3.5" />
                      <span className="font-bold tracking-widest">{ppe.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Tools Section */}
            <div>
              <button
                onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <CogIcon className="h-4 w-4" />
                  <span className="font-bold tracking-widest">Tools</span>
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileToolsOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {toolsMenu.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileToolsOpen(false);
                      }}
                    >
                      <tool.icon className="h-3.5 w-3.5" />
                      <span className="font-bold tracking-widest">{tool.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Project Issued Materials Section */}
            <div>
              <button
                onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <CubeIcon className="h-4 w-4" />
                  <span className="font-bold tracking-widest">Materials</span>
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileProjectIssuedOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {projectIssuedMenu.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileProjectIssuedOpen(false);
                      }}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="font-bold tracking-widest">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => {
                    signIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 hover:scale-105"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="font-bold tracking-widest">Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}