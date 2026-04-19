'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Box,
  ClipboardList,
  Download,
  Filter,
  Users,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetStatusChart } from "@/app/components/dashboard/asset-status-chart"
import { AssetTypeDistribution } from "@/app/components/dashboard/asset-type-distribution"
import { MaintenanceSchedule } from "@/app/components/dashboard/maintenance-schedule"
import { useAppTheme } from '@/app/contexts/ThemeContext'
import type { DashboardOverviewResponse } from '@/types/dashboard'

type ChartTheme = 'light' | 'dark' | 'glassmorphic'

export default function DashboardPage() {
  const { theme } = useAppTheme();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const res = await fetch('/api/dashboard/overview');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load overview');
      }
      setOverview(json as DashboardOverviewResponse);
    } catch (e) {
      setOverview(null);
      setOverviewError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  // Animated particle background
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

        // Draw particle - theme-based colors
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        if (theme === 'light') {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // blue for light theme
        } else if (theme === 'glassmorphic') {
          ctx.fillStyle = 'rgba(45, 212, 191, 0.6)'; // teal for glassmorphic
        } else {
          ctx.fillStyle = 'rgba(45, 212, 191, 0.6)'; // teal for dark theme
        }
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
              if (theme === 'light') {
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`;
              } else {
                ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
              }
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
  }, [theme]);

  // Theme-based styling function
  const getBackgroundStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]',
          textColor: 'text-white',
          headerBg: 'bg-white/10 backdrop-blur-lg border border-white/20',
          headerHover: 'hover:bg-white/15',
          headerTitle: 'bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent',
          headerSubtitle: 'text-white/80',
          buttonOutline: 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-teal-400',
          buttonPrimary: 'bg-teal-400 hover:bg-teal-500 text-white',
          tabsBg: 'bg-white/10 backdrop-blur-md border border-white/20',
          tabsTrigger: 'data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 data-[state=active]:border-white/30',
          cardBg: 'bg-white/10 backdrop-blur-lg border border-white/20',
          cardHover: 'hover:bg-white/15',
          cardTitle: 'text-white',
          cardDescription: 'text-white/70',
          cardValue: 'text-teal-400',
          cardSubtext: 'text-white/70',
          iconColor: 'text-teal-400',
          sectionHeading: 'text-lg font-semibold tracking-tight text-white',
          sectionSub: 'text-sm text-white/75',
          rowTitle: 'text-sm font-medium text-white',
          rowMuted: 'text-xs text-white/70',
          rowBody: 'text-sm text-white/85',
          rowBorder: 'border-white/20',
          rowBg: 'border-white/20 bg-white/5 backdrop-blur-sm',
        };
      case 'light':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100',
          textColor: 'text-gray-900',
          headerBg: 'bg-white border-2 border-blue-200 shadow-lg',
          headerHover: 'hover:bg-blue-50',
          headerTitle: 'bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent',
          headerSubtitle: 'text-gray-700',
          buttonOutline: 'bg-white border-2 border-blue-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          tabsBg: 'bg-white border-2 border-blue-200',
          tabsTrigger: 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-700 data-[state=active]:border-blue-300',
          cardBg: 'bg-white border-2 border-blue-200 shadow-md',
          cardHover: 'hover:bg-blue-50',
          cardTitle: 'text-gray-800',
          cardDescription: 'text-gray-600',
          cardValue: 'text-blue-600',
          cardSubtext: 'text-gray-600',
          iconColor: 'text-blue-600',
          sectionHeading: 'text-lg font-semibold tracking-tight text-gray-900',
          sectionSub: 'text-sm text-gray-600',
          rowTitle: 'text-sm font-medium text-gray-900',
          rowMuted: 'text-xs text-gray-600',
          rowBody: 'text-sm text-gray-700',
          rowBorder: 'border-gray-200',
          rowBg: 'border-gray-200 bg-white/90',
        };
      default: // dark theme
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
          textColor: 'text-slate-100',
          headerBg: 'bg-slate-800/90 border border-slate-700 shadow-xl',
          headerHover: 'hover:bg-slate-700/90',
          headerTitle: 'bg-gradient-to-r from-slate-100 to-teal-400 bg-clip-text text-transparent',
          headerSubtitle: 'text-slate-300',
          buttonOutline: 'bg-slate-700/50 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-teal-400',
          buttonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white',
          tabsBg: 'bg-slate-800/90 border border-slate-700',
          tabsTrigger: 'data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 data-[state=active]:border-slate-600',
          cardBg: 'bg-slate-800/90 border border-slate-700 shadow-xl',
          cardHover: 'hover:bg-slate-700/90',
          cardTitle: 'text-slate-100',
          cardDescription: 'text-slate-400',
          cardValue: 'text-teal-400',
          cardSubtext: 'text-slate-400',
          iconColor: 'text-teal-400',
          sectionHeading: 'text-lg font-semibold tracking-tight text-slate-100',
          sectionSub: 'text-sm text-slate-400',
          rowTitle: 'text-sm font-medium text-slate-100',
          rowMuted: 'text-xs text-slate-400',
          rowBody: 'text-sm text-slate-300',
          rowBorder: 'border-slate-600',
          rowBg: 'border-slate-600 bg-slate-900/40',
        };
    }
  };

  const backgroundStyles = getBackgroundStyles();

  const chartTheme: ChartTheme =
    theme === 'light' ? 'light' : theme === 'glassmorphic' ? 'glassmorphic' : 'dark';
  const chartGrid =
    theme === 'light' ? '#e2e8f0' : theme === 'glassmorphic' ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.22)';
  const chartAxis =
    theme === 'light' ? '#64748b' : theme === 'glassmorphic' ? 'rgba(255,255,255,0.65)' : '#94a3b8';

  const calibrationScheduleItems = useMemo(() => {
    if (!overview?.upcomingCalibrations?.length) return [];
    return overview.upcomingCalibrations.map((c, i) => ({
      id: `${c.assetnumber}-${i}`,
      asset: (c.assetdescription && c.assetdescription.trim()) || `Asset ${c.assetnumber}`,
      subtitle: c.calibratedby
        ? `Certificate valid to · Last calibrated by ${c.calibratedby}`
        : 'Upcoming certificate expiry',
      dateLabel: c.calibrationtodate
        ? new Date(c.calibrationtodate).toLocaleDateString(undefined, { dateStyle: 'medium' })
        : '—',
      status: 'scheduled' as const,
    }));
  }, [overview]);

  const fmtDateTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '—';

  return (
    <div className={backgroundStyles.container}>
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
          {/* Header Section */}
          <div className="mb-8">
            <div className={`${backgroundStyles.headerBg} ${backgroundStyles.headerHover} rounded-3xl p-8 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h1 className={`text-2xl md:text-3xl font-bold ${backgroundStyles.headerTitle}`}>
                  Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 gap-1 ${backgroundStyles.buttonOutline}`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 gap-1 ${backgroundStyles.buttonOutline}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className={`h-8 ${backgroundStyles.buttonPrimary}`}
                  >
                    <span>Generate Report</span>
                  </Button>
                </div>
              </div>
              <p className={`${backgroundStyles.headerSubtitle} text-lg`}>Monitor and manage all your assets in one place</p>
            </div>
          </div>
          <Tabs defaultValue="overview">
            <div className="flex items-center mb-6">
              <TabsList className={backgroundStyles.tabsBg}>
                <TabsTrigger 
                  value="overview"
                  className={backgroundStyles.tabsTrigger}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className={backgroundStyles.tabsTrigger}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className={backgroundStyles.tabsTrigger}
                >
                  Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className={backgroundStyles.tabsTrigger}
                >
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-8">
              {overviewError ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${backgroundStyles.rowBorder} ${backgroundStyles.rowBg} ${backgroundStyles.rowBody}`}
                >
                  {overviewError}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`ml-3 h-8 ${backgroundStyles.buttonOutline}`}
                    onClick={() => loadOverview()}
                  >
                    Retry
                  </Button>
                </div>
              ) : null}

              <section className="space-y-3">
                <div>
                  <h2 className={backgroundStyles.sectionHeading}>Overview</h2>
                  <p className={backgroundStyles.sectionSub}>
                    Live counts from equipment and tools plus fixed assets, with custody coverage.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Total assets</CardTitle>
                      <Box className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold tabular-nums tracking-tight ${backgroundStyles.cardValue}`}>
                        {overviewLoading ? '…' : overview ? overview.summary.totalAssets.toLocaleString() : '—'}
                      </div>
                      <p className={`text-xs ${backgroundStyles.cardSubtext}`}>
                        {overviewLoading
                          ? 'Loading from equipmentandtools and fixedassets…'
                          : `${overview?.summary.assetsAddedThisMonth ?? 0} added this month · ${overview?.summary.mmeCount ?? 0} MME / ${overview?.summary.fixedAssetCount ?? 0} fixed`}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>In custody</CardTitle>
                      <Users className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold tabular-nums tracking-tight ${backgroundStyles.cardValue}`}>
                        {overviewLoading ? '…' : overview ? overview.summary.assetsInCustody.toLocaleString() : '—'}
                      </div>
                      <p className={`text-xs ${backgroundStyles.cardSubtext}`}>
                        {overviewLoading
                          ? 'Loading equipmentcustody…'
                          : `${overview?.summary.custodyPercent ?? 0}% of registered assets have an active custody row`}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Calibrations due soon</CardTitle>
                      <Wrench className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold tabular-nums tracking-tight ${backgroundStyles.cardValue}`}>
                        {overviewLoading ? '…' : overview ? String(overview.summary.calibrationsDueSoon) : '—'}
                      </div>
                      <p className={`text-xs ${backgroundStyles.cardSubtext}`}>
                        Latest certificate per asset expiring within 30 days (equipmentcalibcertificates)
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Expired calibrations</CardTitle>
                      <AlertTriangle className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold tabular-nums tracking-tight ${backgroundStyles.cardValue}`}>
                        {overviewLoading ? '…' : overview ? String(overview.summary.expiredCalibrations) : '—'}
                      </div>
                      <p className={`text-xs ${backgroundStyles.cardSubtext}`}>
                        Assets whose latest certificate end date is already past
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className={backgroundStyles.sectionHeading}>Status and categories</h2>
                  <p className={backgroundStyles.sectionSub}>
                    Combined <span className="font-medium">assetstatus</span> and{' '}
                    <span className="font-medium">assetcategory</span> from both registers.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className={`lg:col-span-4 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <CardTitle className={`text-base font-semibold tracking-tight ${backgroundStyles.cardTitle}`}>
                        Asset status overview
                      </CardTitle>
                      <CardDescription className={backgroundStyles.cardDescription}>
                        Counts by recorded status across MME and fixed assets
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <AssetStatusChart
                        data={overview?.assetStatus ?? []}
                        gridStroke={chartGrid}
                        axisStroke={chartAxis}
                      />
                    </CardContent>
                  </Card>
                  <Card className={`lg:col-span-3 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <CardTitle className={`text-base font-semibold tracking-tight ${backgroundStyles.cardTitle}`}>
                        Asset type distribution
                      </CardTitle>
                      <CardDescription className={backgroundStyles.cardDescription}>
                        Merged categories from both collections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AssetTypeDistribution segments={overview?.assetTypeDistribution ?? []} theme={chartTheme} />
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className={backgroundStyles.sectionHeading}>Custody and calibration</h2>
                  <p className={backgroundStyles.sectionSub}>
                    Recent rows from <span className="font-medium">equipmentcustody</span>; next expiries from{' '}
                    <span className="font-medium">equipmentcalibcertificates</span>.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <CardTitle className={`text-base font-semibold tracking-tight ${backgroundStyles.cardTitle}`}>
                        Recent custody activity
                      </CardTitle>
                      <CardDescription className={backgroundStyles.cardDescription}>
                        Newest assignments by custody start date
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {overviewLoading ? (
                        <p className={`text-sm ${backgroundStyles.rowMuted}`}>Loading…</p>
                      ) : overview?.recentCustody?.length ? (
                        overview.recentCustody.map((row, idx) => (
                          <div
                            key={`${row.assetnumber}-${row.custodyfrom}-${idx}`}
                            className={`rounded-xl border p-3 ${backgroundStyles.rowBorder} ${backgroundStyles.rowBg}`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className={backgroundStyles.rowTitle}>{row.assetnumber}</p>
                              <span className={backgroundStyles.rowMuted}>{fmtDateTime(row.custodyfrom)}</span>
                            </div>
                            <p className={`mt-1 ${backgroundStyles.rowBody}`}>
                              {row.employeename || '—'}
                              {row.employeenumber ? ` · ${row.employeenumber}` : ''}
                            </p>
                            <p className={`mt-0.5 text-xs ${backgroundStyles.rowMuted}`}>
                              {[row.locationType, row.location].filter(Boolean).join(' · ') || '—'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm ${backgroundStyles.rowMuted}`}>No custody rows returned.</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <CardTitle className={`text-base font-semibold tracking-tight ${backgroundStyles.cardTitle}`}>
                        Upcoming calibration expiries
                      </CardTitle>
                      <CardDescription className={backgroundStyles.cardDescription}>
                        Next certificate end date per asset (soonest first)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MaintenanceSchedule
                        items={calibrationScheduleItems}
                        titleClass={backgroundStyles.rowTitle}
                        mutedClass={backgroundStyles.rowMuted}
                        borderClass={backgroundStyles.rowBorder}
                        rowBgClass={backgroundStyles.rowBg}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className={backgroundStyles.sectionHeading}>Latest PPE transactions</h2>
                  <p className={backgroundStyles.sectionSub}>Most recent issues from the ppe-records collection.</p>
                </div>
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardContent className="space-y-2 pt-6">
                    {overviewLoading ? (
                      <p className={`text-sm ${backgroundStyles.rowMuted}`}>Loading…</p>
                    ) : overview?.recentPpe?.length ? (
                      overview.recentPpe.map((r) => (
                        <div
                          key={r._id}
                          className={`rounded-xl border p-3 ${backgroundStyles.rowBorder} ${backgroundStyles.rowBg}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className={backgroundStyles.rowTitle}>{r.ppeName}</p>
                            <span className={backgroundStyles.rowMuted}>{fmtDateTime(r.dateOfIssue)}</span>
                          </div>
                          <p className={`mt-1 ${backgroundStyles.rowBody}`}>
                            {r.userEmpName} · {r.userEmpNumber} · Qty {r.quantityIssued}
                          </p>
                          {r.issuedByName ? (
                            <p className={`mt-0.5 text-xs ${backgroundStyles.rowMuted}`}>Issued by {r.issuedByName}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${backgroundStyles.rowMuted}`}>No PPE issue records found.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className={backgroundStyles.sectionHeading}>Recent project return materials</h2>
                  <p className={backgroundStyles.sectionSub}>
                    Ten newest rows from projreturnmaterials (non-disposed), by createdAt.
                  </p>
                </div>
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardContent className="space-y-2 pt-6">
                    {overviewLoading ? (
                      <p className={`text-sm ${backgroundStyles.rowMuted}`}>Loading…</p>
                    ) : overview?.recentProjectReturns?.length ? (
                      overview.recentProjectReturns.map((m) => (
                        <div
                          key={m.materialid}
                          className={`rounded-xl border p-3 ${backgroundStyles.rowBorder} ${backgroundStyles.rowBg}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className={backgroundStyles.rowTitle}>{m.materialDescription}</p>
                            <span className={backgroundStyles.rowMuted}>{fmtDateTime(m.createdAt)}</span>
                          </div>
                          <p className={`mt-1 text-xs ${backgroundStyles.rowMuted}`}>
                            {m.materialCode} · ID {m.materialid}
                            {m.sourceProject ? ` · ${m.sourceProject}` : ''}
                          </p>
                          <p className={`mt-1 ${backgroundStyles.rowBody}`}>
                            Qty {m.quantity} {m.uom}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${backgroundStyles.rowMuted}`}>No return material rows found.</p>
                    )}
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={backgroundStyles.cardTitle}>Analytics</CardTitle>
                  <CardDescription className={backgroundStyles.cardDescription}>Detailed analytics and trends for your assets</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <BarChart3 className={`h-10 w-10 ${backgroundStyles.iconColor}`} />
                    <h3 className={`text-lg font-medium ${backgroundStyles.cardTitle}`}>Analytics Dashboard</h3>
                    <p className={`text-sm ${backgroundStyles.cardDescription}`}>
                      View detailed analytics about asset utilization, maintenance costs, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={backgroundStyles.cardTitle}>Reports</CardTitle>
                  <CardDescription className={backgroundStyles.cardDescription}>Generate and view custom reports</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ClipboardList className={`h-10 w-10 ${backgroundStyles.iconColor}`} />
                    <h3 className={`text-lg font-medium ${backgroundStyles.cardTitle}`}>Report Center</h3>
                    <p className={`text-sm ${backgroundStyles.cardDescription}`}>
                      Generate custom reports filtered by asset type, location, status, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={backgroundStyles.cardTitle}>Notifications</CardTitle>
                  <CardDescription className={backgroundStyles.cardDescription}>System alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Activity className={`h-10 w-10 ${backgroundStyles.iconColor}`} />
                    <h3 className={`text-lg font-medium ${backgroundStyles.cardTitle}`}>Notification Center</h3>
                    <p className={`text-sm ${backgroundStyles.cardDescription}`}>
                      View and manage all system notifications, alerts, and reminders.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  )
}

