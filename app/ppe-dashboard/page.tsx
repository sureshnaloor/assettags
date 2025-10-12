'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PPEDashboardStats {
  totalPPEItems: number;
  totalIssueRecords: number;
  totalBulkIssues: number;
  totalEmployees: number;
  overdueItems: number;
  recentIssues: number;
}

export default function PPEDashboardPage() {
  const [stats, setStats] = useState<PPEDashboardStats>({
    totalPPEItems: 0,
    totalIssueRecords: 0,
    totalBulkIssues: 0,
    totalEmployees: 0,
    overdueItems: 0,
    recentIssues: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics in parallel
      const [
        ppeResponse,
        issueResponse,
        bulkResponse,
        empResponse,
        overdueResponse,
        recentResponse
      ] = await Promise.all([
        fetch('/api/ppe-master'),
        fetch('/api/ppe-records'),
        fetch('/api/ppe-bulk-issues'),
        fetch('/api/employees'),
        fetch('/api/ppe-due-for-reissue?daysOverdue=0'),
        fetch('/api/ppe-records?limit=5')
      ]);

      const [
        ppeResult,
        issueResult,
        bulkResult,
        empResult,
        overdueResult,
        recentResult
      ] = await Promise.all([
        ppeResponse.json(),
        issueResponse.json(),
        bulkResponse.json(),
        empResponse.json(),
        overdueResponse.json(),
        recentResponse.json()
      ]);

      setStats({
        totalPPEItems: ppeResult.success ? ppeResult.data.records.length : 0,
        totalIssueRecords: issueResult.success ? issueResult.data.records.length : 0,
        totalBulkIssues: bulkResult.success ? bulkResult.data.records.length : 0,
        totalEmployees: empResult.success ? empResult.data.records.filter((emp: any) => emp.active !== 'N').length : 0,
        overdueItems: overdueResult.success ? overdueResult.data.length : 0,
        recentIssues: recentResult.success ? recentResult.data.records.length : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'PPE Master',
      description: 'Manage PPE master data',
      href: '/ppe-master',
      color: 'bg-blue-500'
    },
    {
      title: 'Issue PPE',
      description: 'Issue PPE to employees',
      href: '/ppe-issue-records',
      color: 'bg-green-500'
    },
    {
      title: 'Bulk Issues',
      description: 'Create bulk PPE issues',
      href: '/ppe-bulk-issues',
      color: 'bg-purple-500'
    },
    {
      title: 'Employee Management',
      description: 'Manage employee records',
      href: '/employee-management',
      color: 'bg-orange-500'
    },
    {
      title: 'Due for Reissue',
      description: 'View PPE due for reissue',
      href: '/ppe-due-for-reissue',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">PPE Management Dashboard</h1>
        <p className="text-gray-600">Overview of Personal Protective Equipment management system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PPE Items</CardTitle>
            <div className="h-4 w-4 text-blue-600">🛡️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalPPEItems}</div>
            <p className="text-xs text-muted-foreground">
              Active PPE items in master
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issue Records</CardTitle>
            <div className="h-4 w-4 text-green-600">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalIssueRecords}</div>
            <p className="text-xs text-muted-foreground">
              Individual PPE issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulk Issues</CardTitle>
            <div className="h-4 w-4 text-purple-600">📦</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalBulkIssues}</div>
            <p className="text-xs text-muted-foreground">
              Bulk PPE issues to departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <div className="h-4 w-4 text-orange-600">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active employees in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <div className="h-4 w-4 text-red-600">⚠️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.overdueItems}</div>
            <p className="text-xs text-muted-foreground">
              PPE items due for reissue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Issues</CardTitle>
            <div className="h-4 w-4 text-gray-600">🕒</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.recentIssues}</div>
            <p className="text-xs text-muted-foreground">
              Recent PPE issues (last 5)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {action.title === 'PPE Master' && '🛡️'}
                      {action.title === 'Issue PPE' && '📋'}
                      {action.title === 'Bulk Issues' && '📦'}
                      {action.title === 'Employee Management' && '👥'}
                      {action.title === 'Due for Reissue' && '⚠️'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">PPE Management Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PPE Master Data Management</li>
                <li>• Individual PPE Issue Tracking</li>
                <li>• Bulk PPE Issue Management</li>
                <li>• Employee Management</li>
                <li>• Due Date Tracking & Alerts</li>
                <li>• Issue History & Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated due date calculations</li>
                <li>• Comprehensive issue tracking</li>
                <li>• Bulk issue management for departments</li>
                <li>• Employee status management</li>
                <li>• Safety compliance tracking</li>
                <li>• Real-time dashboard monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
