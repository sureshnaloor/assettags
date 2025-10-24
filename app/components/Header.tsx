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
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-50/98 via-white/98 to-slate-50/98 dark:from-slate-900/98 dark:via-slate-800/98 dark:to-slate-900/98 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative w-32 h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logosmarttag.png"
                alt="SmartTags Logo"
                fill
                className="object-contain drop-shadow-md filter brightness-110"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center space-x-1.5 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-800/40 border ${
                idx < 4
                  ? 'bg-gradient-to-r from-slate-200/30 to-slate-300/30 text-slate-700 dark:text-slate-200 hover:from-slate-200/50 hover:to-slate-300/50 border-slate-200/30 dark:border-slate-600/30'
                  : 'bg-gradient-to-r from-slate-200/20 to-slate-300/20 text-slate-600 dark:text-slate-300 hover:from-slate-200/40 hover:to-slate-300/40 border-slate-200/20 dark:border-slate-600/20'
              }`}
            >
              <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="font-medium tracking-wide">{item.name}</span>
            </Link>
          ))}
          
          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowReportsMenu(true)}
              onMouseLeave={() => setShowReportsMenu(false)}
              className="group flex items-center space-x-1.5 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-200/25 to-slate-300/25 text-slate-600 dark:text-slate-300 hover:from-slate-200/45 hover:to-slate-300/45 hover:shadow-slate-200/20 border border-slate-200/25 dark:border-slate-600/25"
            >
              <DocumentChartBarIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="font-medium tracking-wide">Reports</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showReportsMenu && (
              <div
                onMouseEnter={() => setShowReportsMenu(true)}
                onMouseLeave={() => setShowReportsMenu(false)}
                className="absolute left-0 top-full mt-2 w-64 rounded-xl z-50 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl backdrop-saturate-150 py-3 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ring-1 ring-white/30 dark:ring-slate-600/50 border border-white/30 dark:border-slate-600/50"
              >
                {reportsMenu.map((report) => (
                  <Link
                    key={report.name}
                    href={report.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                  >
                    <ChartBarIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <span className="tracking-wide">{report.name}</span>
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
              className="group flex items-center space-x-1.5 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-200/25 to-slate-300/25 text-slate-600 dark:text-slate-300 hover:from-slate-200/45 hover:to-slate-300/45 hover:shadow-slate-200/20 border border-slate-200/25 dark:border-slate-600/25"
            >
              <ShieldCheckIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="font-medium tracking-wide">PPE</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showPPEMenu && (
              <div
                onMouseEnter={() => setShowPPEMenu(true)}
                onMouseLeave={() => setShowPPEMenu(false)}
                className="absolute left-0 top-full mt-2 w-64 rounded-xl z-50 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl backdrop-saturate-150 py-3 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ring-1 ring-white/30 dark:ring-slate-600/50 border border-white/30 dark:border-slate-600/50"
              >
                {ppeMenu.map((ppe) => (
                  <Link
                    key={ppe.name}
                    href={ppe.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                  >
                    <ppe.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <span className="tracking-wide">{ppe.name}</span>
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
              className="group flex items-center space-x-1.5 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-200/25 to-slate-300/25 text-slate-600 dark:text-slate-300 hover:from-slate-200/45 hover:to-slate-300/45 hover:shadow-slate-200/20 border border-slate-200/25 dark:border-slate-600/25"
            >
              <CogIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="font-medium tracking-wide">Tools</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showToolsMenu && (
              <div
                onMouseEnter={() => setShowToolsMenu(true)}
                onMouseLeave={() => setShowToolsMenu(false)}
                className="absolute left-0 top-full mt-2 w-64 rounded-xl z-50 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl backdrop-saturate-150 py-3 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ring-1 ring-white/30 dark:ring-slate-600/50 border border-white/30 dark:border-slate-600/50"
              >
                {toolsMenu.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                  >
                    <tool.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <span className="tracking-wide">{tool.name}</span>
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
              className="group flex items-center space-x-1.5 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-200/25 to-slate-300/25 text-slate-600 dark:text-slate-300 hover:from-slate-200/45 hover:to-slate-300/45 hover:shadow-slate-200/20 border border-slate-200/25 dark:border-slate-600/25"
            >
              <CubeIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <span className="font-medium tracking-wide">Project Issued</span>
              <ChevronDownIcon className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            {showProjectIssuedMenu && (
              <div
                onMouseEnter={() => setShowProjectIssuedMenu(true)}
                onMouseLeave={() => setShowProjectIssuedMenu(false)}
                className="absolute left-0 top-full mt-2 w-64 rounded-xl z-50 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl backdrop-saturate-150 py-3 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ring-1 ring-white/30 dark:ring-slate-600/50 border border-white/30 dark:border-slate-600/50"
              >
                {projectIssuedMenu.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                  >
                    <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <span className="tracking-wide">{item.name}</span>
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
              className="hidden sm:flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 border border-blue-500/20 hover:border-blue-400/30"
            >
              <UserIcon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
              <span className="tracking-wide">Sign In</span>
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
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-gradient-to-br from-white/98 to-slate-50/98 dark:from-slate-800/98 dark:to-slate-700/98 backdrop-blur-lg py-3 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ring-1 ring-slate-200/50 dark:ring-slate-600/50 border border-slate-100/50 dark:border-slate-700/50 z-50">
                  <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-600/50 font-medium">
                    {session.user?.email}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/auth/change-password"
                      className="group flex items-center space-x-3 w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <KeyIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                      <span className="tracking-wide">Change Password</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="group flex items-center space-x-3 w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 mx-2 rounded-lg"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                      <span className="tracking-wide">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 transition-transform duration-300 rotate-180" />
            ) : (
              <Bars3Icon className="h-6 w-6 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-b from-white/98 to-slate-50/98 dark:from-slate-900/98 dark:to-slate-800/98 backdrop-blur-lg shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center space-x-3 px-3 py-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 rounded-xl transition-all duration-300 text-sm font-medium hover:shadow-sm hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="tracking-wide">{item.name}</span>
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

            {/* Mobile Tools Section */}
            <div>
              <button
                onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
              >
                <div className="flex items-center space-x-3">
                  <CogIcon className="h-5 w-5" />
                  <span>Tools</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileToolsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {toolsMenu.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 font-light"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileToolsOpen(false);
                      }}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span>{tool.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Project Issued Materials Section */}
            <div>
              <button
                onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 text-sm font-light"
              >
                <div className="flex items-center space-x-3">
                  <CubeIcon className="h-5 w-5" />
                  <span>Project Issued</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileProjectIssuedOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {projectIssuedMenu.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200 font-light"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileProjectIssuedOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
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