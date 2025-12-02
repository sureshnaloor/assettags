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

export default function DashboardPage() {
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-teal-400"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-teal-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 bg-teal-400 hover:bg-teal-500 text-white"
                  >
                    <span>Generate Report</span>
                  </Button>
                </div>
              </div>
              <p className="text-white/80 text-lg">Monitor and manage all your assets in one place</p>
            </div>
          </div>
          <Tabs defaultValue="overview">
            <div className="flex items-center mb-6">
              <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 data-[state=active]:border-white/30"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 data-[state=active]:border-white/30"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 data-[state=active]:border-white/30"
                >
                  Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 data-[state=active]:border-white/30"
                >
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Assets</CardTitle>
                    <Box className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-400">1,248</div>
                    <p className="text-xs text-white/70">+12 assets added this month</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Assets In Use</CardTitle>
                    <Users className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-400">842</div>
                    <p className="text-xs text-white/70">67.5% of total assets</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Pending Maintenance</CardTitle>
                    <Wrench className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-400">36</div>
                    <p className="text-xs text-white/70">8 scheduled for this week</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-400">12</div>
                    <p className="text-xs text-white/70">3 critical alerts requiring attention</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Asset Status Overview</CardTitle>
                    <CardDescription className="text-white/70">Distribution of assets by current status</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <AssetStatusChart />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Asset Type Distribution</CardTitle>
                    <CardDescription className="text-white/70">Breakdown of assets by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetTypeDistribution />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activities</CardTitle>
                    <CardDescription className="text-white/70">Latest asset movements and maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivities />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Maintenance</CardTitle>
                    <CardDescription className="text-white/70">Scheduled maintenance for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceSchedule />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Analytics</CardTitle>
                  <CardDescription className="text-white/70">Detailed analytics and trends for your assets</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <BarChart3 className="h-10 w-10 text-teal-400" />
                    <h3 className="text-lg font-medium text-white">Analytics Dashboard</h3>
                    <p className="text-sm text-white/70">
                      View detailed analytics about asset utilization, maintenance costs, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Reports</CardTitle>
                  <CardDescription className="text-white/70">Generate and view custom reports</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ClipboardList className="h-10 w-10 text-teal-400" />
                    <h3 className="text-lg font-medium text-white">Report Center</h3>
                    <p className="text-sm text-white/70">
                      Generate custom reports filtered by asset type, location, status, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-white/70">System alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Activity className="h-10 w-10 text-teal-400" />
                    <h3 className="text-lg font-medium text-white">Notification Center</h3>
                    <p className="text-sm text-white/70">
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

