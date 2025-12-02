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
    <header className="sticky top-0 z-50 w-full bg-[rgba(26,35,50,0.95)] backdrop-blur-lg border-b border-white/10 shadow-sm">
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
              <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 whitespace-nowrap">
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
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
              >
                <HomeIcon className="h-4 w-4 text-teal-400" />
                <span>Dashboard</span>
              </Link>
              
              {/* Reports Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowReportsMenu(true)}
                  onMouseLeave={() => setShowReportsMenu(false)}
                  onClick={() => setActiveSection('reports')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
                >
                  <DocumentChartBarIcon className="h-4 w-4 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Reports</span>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showReportsMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowReportsMenu(true)} />
                    <div
                      onMouseEnter={() => setShowReportsMenu(true)}
                      onMouseLeave={() => setShowReportsMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/10 backdrop-blur-lg border border-white/20 py-2 shadow-lg shadow-black/20"
                    >
                      {reportsMenu.map((report) => (
                        <Link
                          key={report.name}
                          href={report.href}
                          onClick={() => {
                            setActiveSection('reports');
                            setShowReportsMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 transition-colors duration-150"
                        >
                          <ChartBarIcon className="h-4 w-4 text-white/70" />
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
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
              >
                <BeakerIcon className="h-4 w-4 text-teal-400" />
                <span>MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                onClick={() => setActiveSection('assets')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
              >
                <BuildingOfficeIcon className="h-4 w-4 text-teal-400" />
                <span>Assets</span>
              </Link>
              
              {/* Tools Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowToolsMenu(true)}
                  onMouseLeave={() => setShowToolsMenu(false)}
                  onClick={() => setActiveSection('tools')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
                >
                  <CogIcon className="h-4 w-4 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Tools</span>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${showToolsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showToolsMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowToolsMenu(true)} />
                    <div
                      onMouseEnter={() => setShowToolsMenu(true)}
                      onMouseLeave={() => setShowToolsMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/10 backdrop-blur-lg border border-white/20 py-2 shadow-lg shadow-black/20"
                    >
                      {toolsMenu.map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          onClick={() => {
                            setActiveSection('tools');
                            setShowToolsMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 transition-colors duration-150"
                        >
                          <tool.icon className="h-4 w-4 text-white/70" />
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
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
                >
                  <CubeIcon className="h-4 w-4 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Materials</span>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${showProjectIssuedMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProjectIssuedMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowProjectIssuedMenu(true)} />
                    <div
                      onMouseEnter={() => setShowProjectIssuedMenu(true)}
                      onMouseLeave={() => setShowProjectIssuedMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/10 backdrop-blur-lg border border-white/20 py-2 shadow-lg shadow-black/20"
                    >
                      {projectIssuedMenu.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setActiveSection('materials');
                            setShowProjectIssuedMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 transition-colors duration-150"
                        >
                          <item.icon className="h-4 w-4 text-white/70" />
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
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-teal-400" />
                <span>Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                onClick={() => setActiveSection('employee')}
                className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
              >
                <UserGroupIcon className="h-4 w-4 text-teal-400" />
                <span>Employee</span>
              </Link>
              
              {/* PPE Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setShowPPEMenu(true)}
                  onMouseLeave={() => setShowPPEMenu(false)}
                  onClick={() => setActiveSection('ppe')}
                  className="flex items-center space-x-2 transition-all duration-200 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 border border-transparent hover:border-white/20"
                >
                  <ShieldCheckIcon className="h-4 w-4 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>PPE</span>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${showPPEMenu ? 'rotate-180' : ''}`} />
                </button>

                {showPPEMenu && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowPPEMenu(true)} />
                    <div
                      onMouseEnter={() => setShowPPEMenu(true)}
                      onMouseLeave={() => setShowPPEMenu(false)}
                      className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/10 backdrop-blur-lg border border-white/20 py-2 shadow-lg shadow-black/20"
                    >
                      {ppeMenu.map((ppe) => (
                        <Link
                          key={ppe.name}
                          href={ppe.href}
                          onClick={() => {
                            setActiveSection('ppe');
                            setShowPPEMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 transition-colors duration-150"
                        >
                          <ppe.icon className="h-4 w-4 text-white/70" />
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
              className="hidden sm:flex items-center space-x-2 ml-2 bg-teal-400 hover:bg-teal-500 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-colors duration-200 shadow-sm hover:shadow-md"
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
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 py-2 shadow-lg shadow-black/20 z-50"
                  >
                    <div className="px-4 py-2.5 text-sm font-medium text-white border-b border-white/20">
                      {session.user?.email}
                    </div>
                    <div className="py-1">
                      <Link
                        href="/auth/change-password"
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 transition-colors duration-150"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <KeyIcon className="h-4 w-4 text-white/70" />
                        <span>Change Password</span>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-white hover:text-red-400 hover:bg-white/10 transition-colors duration-150"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 text-white/70" />
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
            className="lg:hidden p-2 ml-2 text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-200"
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
        <div className="lg:hidden border-t border-white/10 bg-[rgba(26,35,50,0.98)] backdrop-blur-lg shadow-lg">
          <div className="px-4 py-4 space-y-4">
            
            {/* LEFT GROUP: Dashboard + Reports */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 px-2">Dashboard & Reports</div>
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4 text-teal-400" />
                <span>Dashboard</span>
              </Link>
              
              <div>
                <button
                  onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentChartBarIcon className="h-4 w-4 text-teal-400" />
                    <span>Reports</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileReportsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {reportsMenu.map((report) => (
                      <Link
                        key={report.name}
                        href={report.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white/80 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileReportsOpen(false);
                        }}
                      >
                        <ChartBarIcon className="h-4 w-4 text-white/70" />
                        <span>{report.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER GROUP: MME + Assets + Tools + Materials */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 px-2">Assets & Management</div>
              <Link
                href="/mme"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BeakerIcon className="h-4 w-4 text-teal-400" />
                <span>MME</span>
              </Link>
              
              <Link
                href="/fixedasset"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingOfficeIcon className="h-4 w-4 text-teal-400" />
                <span>Assets</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <CogIcon className="h-4 w-4 text-teal-400" />
                    <span>Tools</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileToolsOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {toolsMenu.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white/80 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileToolsOpen(false);
                        }}
                      >
                        <tool.icon className="h-4 w-4 text-white/70" />
                        <span>{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="h-4 w-4 text-teal-400" />
                    <span>Materials</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileProjectIssuedOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {projectIssuedMenu.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white/80 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileProjectIssuedOpen(false);
                        }}
                      >
                        <item.icon className="h-4 w-4 text-white/70" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT GROUP: Search + Employee + PPE */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 px-2">Search & Users</div>
              <Link
                href="/search"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-teal-400" />
                <span>Search</span>
              </Link>
              
              <Link
                href="/employee-management"
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-4 w-4 text-teal-400" />
                <span>Employee</span>
              </Link>

              <div>
                <button
                  onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-white hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-4 w-4 text-teal-400" />
                    <span>PPE</span>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobilePPEOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {ppeMenu.map((ppe) => (
                      <Link
                        key={ppe.name}
                        href={ppe.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white/80 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobilePPEOpen(false);
                        }}
                      >
                        <ppe.icon className="h-4 w-4 text-white/70" />
                        <span>{ppe.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    signIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium text-white bg-teal-400 hover:bg-teal-500 rounded-lg transition-colors duration-200"
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