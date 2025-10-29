'use client';

import Image from 'next/image';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useNavigation } from '@/app/contexts/NavigationContext';
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
  CubeIcon,
  MagnifyingGlassIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session, status } = useSession();
  const { setActiveSection } = useNavigation();
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
    { name: 'MME', href: '/mme', icon: BeakerIcon },
    { name: 'Assets', href: '/fixedasset', icon: BuildingOfficeIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
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
        { name: 'Tools Management', href: '/tools', icon: WrenchScrewdriverIcon },
        { name: 'Tools Reports', href: '/tools/reports', icon: ClipboardDocumentIcon },
      ];

      const projectIssuedMenu = [
        { name: 'Project Issued Materials', href: '/projectissued-materials', icon: CubeIcon },
        { name: 'Project Return Materials', href: '/projectreturn-materials', icon: CubeIcon },
        { name: 'Disposed Materials', href: '/disposed-materials', icon: ExclamationTriangleIcon },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40">
      <div className="w-full h-18 flex items-center justify-between pb-1">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative w-48 h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/smarttags.jpg"
                alt="AssetTags Logo"
                fill
                className="object-contain drop-shadow-md filter brightness-110"
                priority
              />
            </div>
            <div className="ml-2">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 dark:from-slate-400 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 whitespace-nowrap" 
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

        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-3">
            {/* Dashboard + Reports Group */}
            <div className="flex items-center space-x-1 px-3 py-2">
              <Link
                href="/dashboard"
                onClick={() => setActiveSection('dashboard')}
                className="group flex items-center space-x-2 transition-all duration-300 px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-800/50 hover:scale-105"
              >
                <HomeIcon className="h-3.5 w-3.5 text-blue-300 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-blue-900 dark:text-blue-100">Dashboard</span>
              </Link>
              
              {/* Reports Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowReportsMenu(true)}
                  onMouseLeave={() => setShowReportsMenu(false)}
                  onClick={() => setActiveSection('reports')}
                  className="group flex items-center space-x-2 transition-all duration-300 px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-800/50 hover:scale-105"
                >
                  <DocumentChartBarIcon className="h-3.5 w-3.5 text-blue-300 dark:text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                  <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-blue-900 dark:text-blue-100">Reports</span>
                  <ChevronDownIcon className="h-3 w-3 text-blue-300 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-180" />
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
                        onClick={() => setActiveSection('reports')}
                        className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                      >
                        <ChartBarIcon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                        <span className="font-bold tracking-widest">{report.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MME + Assets + Tools + Materials Group */}
            <div className="flex items-center space-x-1 px-3 py-2">
              <Link
                href="/mme"
                onClick={() => setActiveSection('mme')}
                className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-yellow-200/50 dark:hover:shadow-yellow-800/50 hover:scale-105"
              >
                <BeakerIcon className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-yellow-600 dark:text-yellow-300">MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                onClick={() => setActiveSection('assets')}
                className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-yellow-200/50 dark:hover:shadow-yellow-800/50 hover:scale-105"
              >
                <BuildingOfficeIcon className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-yellow-600 dark:text-yellow-300">Assets</span>
              </Link>
              
              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowToolsMenu(true)}
                  onMouseLeave={() => setShowToolsMenu(false)}
                  onClick={() => setActiveSection('tools')}
                  className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-yellow-200/50 dark:hover:shadow-yellow-800/50 hover:scale-105"
                >
                  <CogIcon className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                  <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-yellow-600 dark:text-yellow-300">Tools</span>
                  <ChevronDownIcon className="h-3 w-3 text-yellow-500 dark:text-yellow-300 transition-transform duration-300 group-hover:rotate-180" />
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
                        onClick={() => setActiveSection('tools')}
                        className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                      >
                        <tool.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                        <span className="font-bold tracking-widest">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Materials Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowProjectIssuedMenu(true)}
                  onMouseLeave={() => setShowProjectIssuedMenu(false)}
                  onClick={() => setActiveSection('materials')}
                  className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-yellow-200/50 dark:hover:shadow-yellow-800/50 hover:scale-105"
                >
                  <CubeIcon className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                  <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-yellow-600 dark:text-yellow-300">Materials</span>
                  <ChevronDownIcon className="h-3 w-3 text-yellow-500 dark:text-yellow-300 transition-transform duration-300 group-hover:rotate-180" />
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
                        onClick={() => setActiveSection('materials')}
                        className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                      >
                        <item.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                        <span className="font-bold tracking-widest">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search + Employee + PPE Group */}
            <div className="flex items-center space-x-1 px-3 py-2">
              <Link
                href="/search"
                onClick={() => setActiveSection('search')}
                className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-green-300/50 dark:hover:shadow-green-700/50 hover:scale-105"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5 text-green-500 dark:text-green-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-green-600 dark:text-green-300">Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                onClick={() => setActiveSection('employee')}
                className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-green-300/50 dark:hover:shadow-green-700/50 hover:scale-105"
              >
                <UserGroupIcon className="h-3.5 w-3.5 text-green-500 dark:text-green-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-green-600 dark:text-green-300">Employee</span>
              </Link>
              
              {/* PPE Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowPPEMenu(true)}
                  onMouseLeave={() => setShowPPEMenu(false)}
                  onClick={() => setActiveSection('ppe')}
                  className="group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-green-300/50 dark:hover:shadow-green-700/50 hover:scale-105"
                >
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-green-500 dark:text-green-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                  <span className="font-normal tracking-wide dark:font-black dark:tracking-widest text-green-600 dark:text-green-300">PPE</span>
                  <ChevronDownIcon className="h-3 w-3 text-green-500 dark:text-green-300 transition-transform duration-300 group-hover:rotate-180" />
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
                        onClick={() => setActiveSection('ppe')}
                        className="group flex items-center space-x-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-800/60 mx-3 rounded-xl hover:scale-105"
                      >
                        <ppe.icon className="h-3.5 w-3.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" />
                        <span className="font-bold tracking-widest">{ppe.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Right side - Theme switcher and auth */}
        <div className="flex items-center">
          <ThemeSwitcher />
          
          {/* Auth Buttons */}
          {status === 'loading' ? (
            <div className="animate-pulse ml-2">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          ) : !session ? (
            <button
              onClick={() => signIn()}
              className="hidden sm:flex items-center space-x-2 ml-2 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105"
            >
              <UserIcon className="h-3.5 w-3.5 transition-transform duration-300 hover:scale-125 hover:rotate-6" />
              <span className="font-bold tracking-widest">Sign In</span>
            </button>
          ) : (
            <div className="relative ml-2">
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
            className="lg:hidden p-2.5 ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:scale-105"
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
          <div className="px-6 py-4 space-y-4">
            
            {/* LEFT GROUP: Dashboard + Reports */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Dashboard & Reports</div>
              <Link
                href="/dashboard"
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-100 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-blue-200/60 dark:hover:shadow-blue-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4 text-blue-300 dark:text-blue-400 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-black tracking-widest">Dashboard</span>
              </Link>
              
              <div>
                <button
                  onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-100 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-blue-200/60 dark:hover:shadow-blue-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentChartBarIcon className="h-4 w-4 text-blue-300 dark:text-blue-400 animate-spin-slow" />
                    <span className="font-black tracking-widest">Reports</span>
                  </div>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-blue-300 dark:text-blue-400 transition-transform duration-300 ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileReportsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {reportsMenu.map((report) => (
                      <Link
                        key={report.name}
                        href={report.href}
                        className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-50/80 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-blue-200/60 dark:hover:shadow-blue-800/60 hover:scale-105"
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
            </div>

            {/* CENTER GROUP: MME + Assets + Tools + Materials */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2">Assets & Management</div>
              <Link
                href="/mme"
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-yellow-200/60 dark:hover:shadow-yellow-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BeakerIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-300 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-black tracking-widest">MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-yellow-200/60 dark:hover:shadow-yellow-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingOfficeIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-300 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-black tracking-widest">Assets</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-yellow-200/60 dark:hover:shadow-yellow-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <CogIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-300 animate-spin-slow" />
                    <span className="font-black tracking-widest">Tools</span>
                  </div>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-transform duration-300 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileToolsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {toolsMenu.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-emerald-200/60 dark:hover:shadow-emerald-800/60 hover:scale-105"
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

              <div>
                <button
                  onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-yellow-200/60 dark:hover:shadow-yellow-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-300 animate-spin-slow" />
                    <span className="font-black tracking-widest">Materials</span>
                  </div>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-yellow-500 dark:text-yellow-300 transition-transform duration-300 ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileProjectIssuedOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {projectIssuedMenu.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-emerald-200/60 dark:hover:shadow-emerald-800/60 hover:scale-105"
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
            </div>

            {/* RIGHT GROUP: Search + Employee + PPE */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Search & Users</div>
              <Link
                href="/search"
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-green-200/60 dark:hover:shadow-green-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-green-500 dark:text-green-300 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-black tracking-widest">Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                className="group flex items-center space-x-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-green-200/60 dark:hover:shadow-green-800/60 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-4 w-4 text-green-500 dark:text-green-300 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 animate-spin-slow" />
                <span className="font-black tracking-widest">Employee</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/80 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-green-200/60 dark:hover:shadow-green-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-4 w-4 text-green-500 dark:text-green-300 animate-spin-slow" />
                    <span className="font-black tracking-widest">PPE</span>
                  </div>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-green-500 dark:text-green-300 transition-transform duration-300 ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobilePPEOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {ppeMenu.map((ppe) => (
                      <Link
                        key={ppe.name}
                        href={ppe.href}
                        className="flex items-center space-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-orange-600 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-100 hover:bg-orange-50/80 dark:hover:bg-orange-900/40 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-orange-200/60 dark:hover:shadow-orange-800/60 hover:scale-105"
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