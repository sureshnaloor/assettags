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
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="w-full h-16 flex items-center justify-between px-4 lg:px-6">
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
            <div className="flex items-center space-x-1">
              <Link
                href="/dashboard"
                onClick={() => setActiveSection('dashboard')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                <HomeIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span>Dashboard</span>
              </Link>
              
              {/* Reports Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowReportsMenu(true)}
                  onMouseLeave={() => setShowReportsMenu(false)}
                  onClick={() => setActiveSection('reports')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <DocumentChartBarIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Reports</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showReportsMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowReportsMenu(true)} />
                    <div
                      onMouseEnter={() => setShowReportsMenu(true)}
                      onMouseLeave={() => setShowReportsMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white dark:bg-slate-800 py-2 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 border border-slate-100 dark:border-slate-700"
                    >
                      {reportsMenu.map((report) => (
                        <Link
                          key={report.name}
                          href={report.href}
                          onClick={() => {
                            setActiveSection('reports');
                            setShowReportsMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                        >
                          <ChartBarIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span>{report.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* MME + Assets + Tools + Materials Group */}
            <div className="flex items-center space-x-1">
              <Link
                href="/mme"
                onClick={() => setActiveSection('mme')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
              >
                <BeakerIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                onClick={() => setActiveSection('assets')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
              >
                <BuildingOfficeIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>Assets</span>
              </Link>
              
              {/* Tools Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowToolsMenu(true)}
                  onMouseLeave={() => setShowToolsMenu(false)}
                  onClick={() => setActiveSection('tools')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                >
                  <CogIcon className="h-4 w-4 text-amber-500 dark:text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Tools</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showToolsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showToolsMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowToolsMenu(true)} />
                    <div
                      onMouseEnter={() => setShowToolsMenu(true)}
                      onMouseLeave={() => setShowToolsMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white dark:bg-slate-800 py-2 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 border border-slate-100 dark:border-slate-700"
                    >
                      {toolsMenu.map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          onClick={() => {
                            setActiveSection('tools');
                            setShowToolsMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-150"
                        >
                          <tool.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span>{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Materials Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowProjectIssuedMenu(true)}
                  onMouseLeave={() => setShowProjectIssuedMenu(false)}
                  onClick={() => setActiveSection('materials')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                >
                  <CubeIcon className="h-4 w-4 text-amber-500 dark:text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Materials</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showProjectIssuedMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProjectIssuedMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowProjectIssuedMenu(true)} />
                    <div
                      onMouseEnter={() => setShowProjectIssuedMenu(true)}
                      onMouseLeave={() => setShowProjectIssuedMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white dark:bg-slate-800 py-2 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 border border-slate-100 dark:border-slate-700"
                    >
                      {projectIssuedMenu.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setActiveSection('materials');
                            setShowProjectIssuedMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-150"
                        >
                          <item.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search + Employee + PPE Group */}
            <div className="flex items-center space-x-1">
              <Link
                href="/search"
                onClick={() => setActiveSection('search')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                onClick={() => setActiveSection('employee')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                <UserGroupIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Employee</span>
              </Link>
              
              {/* PPE Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowPPEMenu(true)}
                  onMouseLeave={() => setShowPPEMenu(false)}
                  onClick={() => setActiveSection('ppe')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                >
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>PPE</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showPPEMenu ? 'rotate-180' : ''}`} />
                </button>

                {showPPEMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowPPEMenu(true)} />
                    <div
                      onMouseEnter={() => setShowPPEMenu(true)}
                      onMouseLeave={() => setShowPPEMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white dark:bg-slate-800 py-2 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 border border-slate-100 dark:border-slate-700"
                    >
                      {ppeMenu.map((ppe) => (
                        <Link
                          key={ppe.name}
                          href={ppe.href}
                          onClick={() => {
                            setActiveSection('ppe');
                            setShowPPEMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150"
                        >
                          <ppe.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span>{ppe.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
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
              className="hidden sm:flex items-center space-x-2 ml-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
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
                <>
                  {/* Invisible bridge to prevent gap */}
                  <div className="absolute right-0 top-full w-full h-2" onMouseEnter={() => setShowProfileMenu(true)} />
                  <div
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white dark:bg-slate-800 py-2 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 border border-slate-100 dark:border-slate-700 z-50"
                  >
                    <div className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                      {session.user?.email}
                    </div>
                    <div className="py-1">
                      <Link
                        href="/auth/change-password"
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <KeyIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>Change Password</span>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            
            {/* LEFT GROUP: Dashboard + Reports */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">Dashboard & Reports</div>
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span>Dashboard</span>
              </Link>
              
              <div>
                <button
                  onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentChartBarIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span>Reports</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileReportsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {reportsMenu.map((report) => (
                      <Link
                        key={report.name}
                        href={report.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileReportsOpen(false);
                        }}
                      >
                        <ChartBarIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{report.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER GROUP: MME + Assets + Tools + Materials */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">Assets & Management</div>
              <Link
                href="/mme"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BeakerIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingOfficeIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>Assets</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <CogIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>Tools</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileToolsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {toolsMenu.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileToolsOpen(false);
                        }}
                      >
                        <tool.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>Materials</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileProjectIssuedOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {projectIssuedMenu.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileProjectIssuedOpen(false);
                        }}
                      >
                        <item.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT GROUP: Search + Employee + PPE */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">Search & Users</div>
              <Link
                href="/search"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Employee</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    <span>PPE</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobilePPEOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {ppeMenu.map((ppe) => (
                      <Link
                        key={ppe.name}
                        href={ppe.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobilePPEOpen(false);
                        }}
                      >
                        <ppe.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{ppe.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    signIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                >
                  <UserIcon className="h-4 w-4" />
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