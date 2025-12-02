'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useNavigation } from '@/app/contexts/NavigationContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { 
  BeakerIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  QrCodeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  UserIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { data: session, status } = useSession();
  const { setActiveSection } = useNavigation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assetCounter, setAssetCounter] = useState(0);
  const [qrText, setQrText] = useState('SMART-ASSET-DEMO');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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
  
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

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

  // Asset counter animation
  useEffect(() => {
    const targetCount = 10000;
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetCount);
      setAssetCounter(newCount);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const features = [
    {
      id: 1,
      title: "MME Management",
      description: "Comprehensive tracking and management of Measuring and Monitoring Equipment with calibration schedules and maintenance records.",
      icon: BeakerIcon,
      link: "/mme",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Fixed Assets",
      description: "Complete lifecycle management of fixed assets with depreciation tracking, location management, and audit trails.",
      icon: BuildingOfficeIcon,
      link: "/fixedasset",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Smart Reports",
      description: "Generate detailed reports for calibrations, equipment status, project allocations, and user assignments.",
      icon: ChartBarIcon,
      link: "/reports",
      color: "from-teal-500 to-emerald-500"
    },
    {
      id: 4,
      title: "QR Code Integration",
      description: "Instant asset identification and information access through QR code scanning technology.",
      icon: QrCodeIcon,
      link: "/asset",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Assets Tracked", icon: "📊" },
    { number: "99.9%", label: "Uptime", icon: "⚡" },
    { number: "24/7", label: "Support", icon: "🛡️" },
    { number: "50+", label: "Companies", icon: "🏢" }
  ];

  const categories = [
    {
      title: 'IT Assets',
      count: '2,500+ Assets',
      image: '/images/office-interior.jpg',
      alt: 'IT Assets',
      subtypes: ['Laptops', 'Desktops', 'Printers', 'Network Devices', 'Mobile Devices', 'Servers']
    },
    {
      title: 'Vehicles',
      count: '800+ Assets',
      image: '/images/construction-equipment.jpg',
      alt: 'Vehicles',
      subtypes: ['Cars', 'Trucks', 'Vans', 'Motorcycles', 'Specialized Vehicles']
    },
    {
      title: 'Land & Building',
      count: '150+ Properties',
      image: '/images/hero-building.jpg',
      alt: 'Land & Building',
      subtypes: ['Office Buildings', 'Warehouses', 'Residential Properties', 'Parking Lots']
    },
    {
      title: 'Measuring Instruments',
      count: '1,200+ Instruments',
      image: '/images/medical-equipment.jpg',
      alt: 'Measuring Instruments',
      subtypes: ['Calipers', 'Scales', 'Thermometers', 'Pressure Gauges', 'Flow Meters']
    },
    {
      title: 'Camp Equipment',
      count: '950+ Appliances',
      image: '/images/restaurant-kitchen.jpg',
      alt: 'Camp Equipment',
      subtypes: ['Tents', 'Camp Stoves', 'Refrigerators', 'Air Conditioners', 'Mixers', 'Cooktops']
    }
  ];

  const landingFeatures = [
    {
      icon: '📍',
      title: 'Real-time Location Tracking',
      description: 'Track asset locations with GPS precision, indoor positioning, and geofencing capabilities. Know exactly where every asset is at all times.'
    },
    {
      icon: '🔧',
      title: 'Maintenance Scheduling',
      description: 'Automated maintenance scheduling with calendar integration, work order management, and vendor coordination. Never miss critical maintenance again.'
    },
    {
      icon: '👥',
      title: 'Custodian Management',
      description: 'Assign and track asset custodians with role-based permissions, transfer workflows, and responsibility chains. Clear accountability for every asset.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics with customizable dashboards, utilization reports, cost analysis, and compliance tracking. Data-driven asset optimization.'
    },
    {
      icon: '🔒',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with audit trails, compliance monitoring, and regulatory reporting. Meet all industry standards with confidence.'
    },
    {
      icon: '📱',
      title: 'Mobile Integration',
      description: 'Full mobile support with QR scanning, offline capabilities, and field data collection. Manage assets anywhere, anytime.'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Glassmorphic Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[rgba(26,35,50,0.95)] backdrop-blur-lg z-50 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/images/smarttagslogo.jpg"
                alt="SmartTags Logo"
                fill
                className="object-contain rounded"
              />
            </div>
            SmartTags
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-2">
              {/* Dashboard + Reports Group */}
              <div className="flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {/* Reports Dropdown */}
                <div className="relative group">
                  <button
                    onMouseEnter={() => setShowReportsMenu(true)}
                    onMouseLeave={() => setShowReportsMenu(false)}
                    onClick={() => setActiveSection('reports')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                  >
                    <DocumentChartBarIcon className="h-4 w-4" />
                    <span>Reports</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showReportsMenu && (
                    <>
                      <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowReportsMenu(true)} />
                      <div
                        onMouseEnter={() => setShowReportsMenu(true)}
                        onMouseLeave={() => setShowReportsMenu(false)}
                        className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-2 shadow-xl border border-white/20"
                      >
                        {reportsMenu.map((report) => (
                          <Link
                            key={report.name}
                            href={report.href}
                            onClick={() => {
                              setActiveSection('reports');
                              setShowReportsMenu(false);
                            }}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-400 hover:bg-white/20 transition-colors duration-150"
                          >
                            <ChartBarIcon className="h-4 w-4 text-slate-400" />
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
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                >
                  <BeakerIcon className="h-4 w-4" />
                  <span>MME</span>
                </Link>
                
                <Link
                  href="/fixedasset"
                  onClick={() => setActiveSection('assets')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Assets</span>
                </Link>
                
                {/* Tools Dropdown */}
                <div className="relative group">
                  <button
                    onMouseEnter={() => setShowToolsMenu(true)}
                    onMouseLeave={() => setShowToolsMenu(false)}
                    onClick={() => setActiveSection('tools')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>Tools</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showToolsMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showToolsMenu && (
                    <>
                      <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowToolsMenu(true)} />
                      <div
                        onMouseEnter={() => setShowToolsMenu(true)}
                        onMouseLeave={() => setShowToolsMenu(false)}
                        className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-2 shadow-xl border border-white/20"
                      >
                        {toolsMenu.map((tool) => (
                          <Link
                            key={tool.name}
                            href={tool.href}
                            onClick={() => {
                              setActiveSection('tools');
                              setShowToolsMenu(false);
                            }}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-400 hover:bg-white/20 transition-colors duration-150"
                          >
                            <tool.icon className="h-4 w-4 text-slate-400" />
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
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                  >
                    <CubeIcon className="h-4 w-4" />
                    <span>Materials</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showProjectIssuedMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProjectIssuedMenu && (
                    <>
                      <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowProjectIssuedMenu(true)} />
                      <div
                        onMouseEnter={() => setShowProjectIssuedMenu(true)}
                        onMouseLeave={() => setShowProjectIssuedMenu(false)}
                        className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-2 shadow-xl border border-white/20"
                      >
                        {projectIssuedMenu.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setActiveSection('materials');
                              setShowProjectIssuedMenu(false);
                            }}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-400 hover:bg-white/20 transition-colors duration-150"
                          >
                            <item.icon className="h-4 w-4 text-slate-400" />
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
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Search</span>
                </Link>
                
                <Link
                  href="/employee-management"
                  onClick={() => setActiveSection('employee')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Employee</span>
                </Link>
                
                {/* PPE Dropdown */}
                <div className="relative group">
                  <button
                    onMouseEnter={() => setShowPPEMenu(true)}
                    onMouseLeave={() => setShowPPEMenu(false)}
                    onClick={() => setActiveSection('ppe')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>PPE</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showPPEMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showPPEMenu && (
                    <>
                      <div className="absolute left-0 top-full w-full h-2" onMouseEnter={() => setShowPPEMenu(true)} />
                      <div
                        onMouseEnter={() => setShowPPEMenu(true)}
                        onMouseLeave={() => setShowPPEMenu(false)}
                        className="absolute left-0 top-full mt-2 w-64 rounded-lg z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-2 shadow-xl border border-white/20"
                      >
                        {ppeMenu.map((ppe) => {
                          const IconComponent = ppe.icon;
                          return (
                            <Link
                              key={ppe.name}
                              href={ppe.href}
                              onClick={() => {
                                setActiveSection('ppe');
                                setShowPPEMenu(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-400 hover:bg-white/20 transition-colors duration-150"
                            >
                              <IconComponent className="h-4 w-4 text-slate-400" />
                              <span>{ppe.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Right side - Theme switcher and auth */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            
            {/* Auth Buttons */}
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 rounded-full bg-white/20"></div>
              </div>
            ) : !session ? (
              <button
                onClick={() => signIn()}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-teal-400 hover:bg-teal-500 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UserIcon className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <div className="relative h-8 w-8 rounded-full bg-white/20 border border-white/30">
                    {session.user?.image ? (
                      <Image
                        src={session.user?.image || ''}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-teal-400 text-sm font-medium text-white">
                        {session.user?.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="absolute right-0 top-full w-full h-2" onMouseEnter={() => setShowProfileMenu(true)} />
                    <div
                      onMouseEnter={() => setShowProfileMenu(true)}
                      onMouseLeave={() => setShowProfileMenu(false)}
                      className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-2 shadow-xl border border-white/20 z-50"
                    >
                      <div className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border-b border-white/20">
                        {session.user?.email}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/auth/change-password"
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-400 hover:bg-white/20 transition-colors duration-150"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <KeyIcon className="h-4 w-4 text-slate-400" />
                          <span>Change Password</span>
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-red-400 hover:bg-white/20 transition-colors duration-150"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 text-slate-400" />
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
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
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
          <div className="lg:hidden border-t border-white/10 bg-[rgba(26,35,50,0.98)] backdrop-blur-xl">
            <div className="px-4 py-4 space-y-4">
              {/* Dashboard + Reports */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">Dashboard & Reports</div>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <div>
                  <button
                    onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentChartBarIcon className="h-4 w-4" />
                      <span>Reports</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isMobileReportsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobileReportsOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {reportsMenu.map((report) => (
                        <Link
                          key={report.name}
                          href={report.href}
                          className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
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
              </div>

              {/* MME + Assets + Tools + Materials */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">Assets & Management</div>
                <Link
                  href="/mme"
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BeakerIcon className="h-4 w-4" />
                  <span>MME</span>
                </Link>
                
                <Link
                  href="/fixedasset"
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Assets</span>
                </Link>

                <div>
                  <button
                    onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <CogIcon className="h-4 w-4" />
                      <span>Tools</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobileToolsOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {toolsMenu.map((tool) => {
                        const IconComponent = tool.icon;
                        return (
                          <Link
                            key={tool.name}
                            href={tool.href}
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileToolsOpen(false);
                            }}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{tool.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setIsMobileProjectIssuedOpen(!isMobileProjectIssuedOpen)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <CubeIcon className="h-4 w-4" />
                      <span>Materials</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isMobileProjectIssuedOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobileProjectIssuedOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {projectIssuedMenu.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileProjectIssuedOpen(false);
                            }}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Search + Employee + PPE */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">Search & Users</div>
                <Link
                  href="/search"
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Search</span>
                </Link>
                
                <Link
                  href="/employee-management"
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Employee</span>
                </Link>

                <div>
                  <button
                    onClick={() => setIsMobilePPEOpen(!isMobilePPEOpen)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>PPE</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isMobilePPEOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobilePPEOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {ppeMenu.map((ppe) => {
                        const IconComponent = ppe.icon;
                        return (
                          <Link
                            key={ppe.name}
                            href={ppe.href}
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-teal-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobilePPEOpen(false);
                            }}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{ppe.name}</span>
                          </Link>
                        );
                      })}
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
      </nav>

      {/* Hero Section with Glassmorphic Design */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
        <div 
          className="absolute inset-0 opacity-30 z-10"
          style={{
            backgroundImage: "url('/images/hero-building.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 z-20"
        />
        
        <div className="relative z-30 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-16">
                  <Image
                    src="/images/smarttags.jpg"
                    alt="SmartTags Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                Asset Management
                <span className="block">Made Simple</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                Streamline your asset tracking with our comprehensive MME and Fixed Assets management system. 
                Get real-time insights, automated workflows, and complete control over your valuable resources.
              </p>
            </div>
            
            {/* Glassmorphic Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">{stat.number}</div>
                  <div className="text-slate-300 text-xs uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Link>
              {!session && (
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-teal-400 border-2 border-teal-400 hover:bg-teal-400 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Asset Categories Section (from landing page) */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2332] text-center mb-4">
            Comprehensive Asset Categories
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Manage every type of asset across your organization with specialized tracking and management features tailored to each category's unique requirements.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-400 cursor-pointer group"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-400"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-[#1a2332] mb-2">{category.title}</h3>
                  <p className="text-teal-400 font-medium text-sm mb-4">{category.count}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.subtypes.map((subtype, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600 group-hover:bg-teal-400 group-hover:text-white transition-colors duration-200"
                      >
                        {subtype}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Demo Section (from landing page) */}
      <section id="demo" className="py-24 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#1a2332] mb-6">
                Instant Asset Access with QR Codes
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Every asset gets a unique QR code that provides instant access to its complete information profile. Simply scan with any smartphone to view location, custodian, maintenance history, and more.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our advanced QR system supports batch generation, custom branding, and integrates seamlessly with your existing workflows.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Try QR Generator
              </Link>
            </div>
            
            <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
              <h3 className="text-2xl font-semibold text-[#1a2332] mb-8">Live QR Code Demo</h3>
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <QRCodeSVG value={qrText} size={160} />
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6">QR Code for: {qrText}</p>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter asset ID or text..."
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors"
                />
                <button
                  onClick={() => setQrText(qrText || 'SMART-ASSET-DEMO')}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 transition-colors"
                >
                  Generate QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (from landing page, using landingFeatures data) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2332] text-center mb-4">
            Powerful Asset Management Features
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Comprehensive tools designed for enterprise-scale asset management with intuitive workflows and advanced automation capabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landingFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-3xl p-10 text-center border-2 border-transparent hover:bg-white hover:border-teal-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1a2332] mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (from landing page) */}
      <section id="about" className="py-24 bg-gradient-to-r from-teal-400 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Asset Management?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of organizations already using SmartAsset to optimize their asset operations
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-teal-400 bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              Start Free Trial
            </Link>
            <a 
              href="#demo" 
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white border-2 border-white hover:bg-white hover:text-teal-400 hover:-translate-y-0.5 transition-all duration-300"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
