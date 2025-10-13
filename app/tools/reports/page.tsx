'use client';
import { useState, useEffect } from 'react';
import { ToolData } from '@/types/tools';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  PrinterIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

export default function ToolsReportsPage() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('all');
  const [filteredTools, setFilteredTools] = useState<ToolData[]>([]);

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, reportType]);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = [...tools];
    
    switch (reportType) {
      case 'available':
        filtered = tools.filter(tool => tool.toolStatus === 'Available');
        break;
      case 'in-use':
        filtered = tools.filter(tool => tool.toolStatus === 'In Use');
        break;
      case 'maintenance':
        filtered = tools.filter(tool => tool.toolStatus === 'Maintenance');
        break;
      case 'retired':
        filtered = tools.filter(tool => tool.toolStatus === 'Retired');
        break;
      case 'warehouse':
        filtered = tools.filter(tool => tool.toolLocation === 'Warehouse');
        break;
      case 'project':
        filtered = tools.filter(tool => tool.toolLocation === 'Project Site');
        break;
      default:
        filtered = tools;
    }
    
    setFilteredTools(filtered);
  };

  const generateReport = () => {
    const reportData = {
      reportType,
      generatedAt: new Date().toISOString(),
      totalTools: filteredTools.length,
      tools: filteredTools
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tools-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const getStatusStats = () => {
    const stats = {
      total: tools.length,
      available: tools.filter(t => t.toolStatus === 'Available').length,
      inUse: tools.filter(t => t.toolStatus === 'In Use').length,
      maintenance: tools.filter(t => t.toolStatus === 'Maintenance').length,
      retired: tools.filter(t => t.toolStatus === 'Retired').length,
    };
    return stats;
  };

  const getLocationStats = () => {
    const stats = {
      warehouse: tools.filter(t => t.toolLocation === 'Warehouse').length,
      projectSite: tools.filter(t => t.toolLocation === 'Project Site').length,
      maintenance: tools.filter(t => t.toolLocation === 'Maintenance').length,
    };
    return stats;
  };

  const getTotalValue = () => {
    return tools.reduce((sum, tool) => sum + (tool.toolCost || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const locationStats = getLocationStats();
  const totalValue = getTotalValue();

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tools Reports</h1>
          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export Report
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PrinterIcon className="h-4 w-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Report Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report Filters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <button
              onClick={() => setReportType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => setReportType('available')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'available' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setReportType('in-use')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'in-use' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              In Use
            </button>
            <button
              onClick={() => setReportType('maintenance')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'maintenance' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setReportType('retired')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'retired' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Retired
            </button>
            <button
              onClick={() => setReportType('warehouse')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'warehouse' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Warehouse
            </button>
            <button
              onClick={() => setReportType('project')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'project' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Project Site
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.inUse}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.maintenance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {reportType === 'all' ? 'All Tools' : 
               reportType === 'available' ? 'Available Tools' :
               reportType === 'in-use' ? 'Tools In Use' :
               reportType === 'maintenance' ? 'Tools Under Maintenance' :
               reportType === 'retired' ? 'Retired Tools' :
               reportType === 'warehouse' ? 'Tools in Warehouse' :
               'Tools at Project Sites'} ({filteredTools.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Asset Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purchase Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTools.map((tool) => (
                  <tr key={tool._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {tool.assetnumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {tool.toolDescription}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tool.toolStatus === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        tool.toolStatus === 'In Use' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        tool.toolStatus === 'Maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tool.toolStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {tool.toolLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {tool.toolCost ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'SAR'
                      }).format(tool.toolCost) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {tool.purchasedDate ? new Date(tool.purchasedDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{statusStats.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Use:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{statusStats.inUse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{statusStats.maintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Retired:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{statusStats.retired}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Location Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Warehouse:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{locationStats.warehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Project Site:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{locationStats.projectSite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{locationStats.maintenance}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Cost:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tools.length > 0 ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(totalValue / tools.length) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
