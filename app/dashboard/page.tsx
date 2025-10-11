import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "Asset Management Dashboard",
  description: "Monitor and manage all your assets in one place",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Box className="h-4 w-4" />
                  Assets
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Truck className="h-4 w-4" />
                  Movement
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-4 w-4" />
                  Schedules
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  Reports
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" className="h-8">
                <span>Generate Report</span>
              </Button>
            </div>
          </div>
          <Tabs defaultValue="overview">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    <Box className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-muted-foreground">+12 assets added this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assets In Use</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">842</div>
                    <p className="text-xs text-muted-foreground">67.5% of total assets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">36</div>
                    <p className="text-xs text-muted-foreground">8 scheduled for this week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">3 critical alerts requiring attention</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Asset Status Overview</CardTitle>
                    <CardDescription>Distribution of assets by current status</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <AssetStatusChart />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Asset Type Distribution</CardTitle>
                    <CardDescription>Breakdown of assets by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetTypeDistribution />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest asset movements and maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivities />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Maintenance</CardTitle>
                    <CardDescription>Scheduled maintenance for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceSchedule />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Detailed analytics and trends for your assets</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      View detailed analytics about asset utilization, maintenance costs, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and view custom reports</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ClipboardList className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Report Center</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate custom reports filtered by asset type, location, status, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>System alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Notification Center</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage all system notifications, alerts, and reminders.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

