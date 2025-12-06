'use client';

import { useEffect, useRef } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Box,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Filter,
  Home,
  Package,
  Search,
  Settings,
  Truck,
  Users,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetStatusChart } from "@/app/components/dashboard/asset-status-chart"
import { AssetTypeDistribution } from "@/app/components/dashboard/asset-type-distribution"
import { MaintenanceSchedule } from "@/app/components/dashboard/maintenance-schedule"
import { RecentActivities } from "@/app/components/dashboard/recent-activities"
import { useAppTheme } from '@/app/contexts/ThemeContext'

export default function DashboardPage() {
  const { theme } = useAppTheme();
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
          iconColor: 'text-teal-400'
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
          iconColor: 'text-blue-600'
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
          iconColor: 'text-teal-400'
        };
    }
  };

  const backgroundStyles = getBackgroundStyles();

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
                <h1 className={`text-4xl md:text-5xl font-bold ${backgroundStyles.headerTitle}`}>
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
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Total Assets</CardTitle>
                    <Box className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${backgroundStyles.cardValue}`}>1,248</div>
                    <p className={`text-xs ${backgroundStyles.cardSubtext}`}>+12 assets added this month</p>
                  </CardContent>
                </Card>
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Assets In Use</CardTitle>
                    <Users className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${backgroundStyles.cardValue}`}>842</div>
                    <p className={`text-xs ${backgroundStyles.cardSubtext}`}>67.5% of total assets</p>
                  </CardContent>
                </Card>
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Pending Maintenance</CardTitle>
                    <Wrench className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${backgroundStyles.cardValue}`}>36</div>
                    <p className={`text-xs ${backgroundStyles.cardSubtext}`}>8 scheduled for this week</p>
                  </CardContent>
                </Card>
                <Card className={`${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${backgroundStyles.cardTitle}`}>Alerts</CardTitle>
                    <AlertTriangle className={`h-4 w-4 ${backgroundStyles.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${backgroundStyles.cardValue}`}>12</div>
                    <p className={`text-xs ${backgroundStyles.cardSubtext}`}>3 critical alerts requiring attention</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className={`lg:col-span-4 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className={backgroundStyles.cardTitle}>Asset Status Overview</CardTitle>
                    <CardDescription className={backgroundStyles.cardDescription}>Distribution of assets by current status</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <AssetStatusChart />
                  </CardContent>
                </Card>
                <Card className={`lg:col-span-3 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className={backgroundStyles.cardTitle}>Asset Type Distribution</CardTitle>
                    <CardDescription className={backgroundStyles.cardDescription}>Breakdown of assets by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetTypeDistribution />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className={`lg:col-span-4 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className={backgroundStyles.cardTitle}>Recent Activities</CardTitle>
                    <CardDescription className={backgroundStyles.cardDescription}>Latest asset movements and maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivities />
                  </CardContent>
                </Card>
                <Card className={`lg:col-span-3 ${backgroundStyles.cardBg} ${backgroundStyles.cardHover} transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className={backgroundStyles.cardTitle}>Upcoming Maintenance</CardTitle>
                    <CardDescription className={backgroundStyles.cardDescription}>Scheduled maintenance for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceSchedule />
                  </CardContent>
                </Card>
              </div>
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

