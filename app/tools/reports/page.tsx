'use client';
import { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

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
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1
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
        ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.2 * (1 - distance / 120)})`;
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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-400"></div>
        <p className="text-white ml-4">Loading...</p>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const locationStats = getLocationStats();
  const totalValue = getTotalValue();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                    Tools Reports
                  </h1>
                  <p className="text-white text-lg">Comprehensive tools inventory reports and analytics</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={generateReport}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl text-green-300 font-semibold hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Export Report
                  </button>
                  <button
                    onClick={printReport}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl text-blue-300 font-semibold hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Filters */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl mb-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Report Filters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <button
              onClick={() => setReportType('all')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'all' 
                  ? 'bg-teal-500/30 border border-teal-400/50 text-teal-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => setReportType('available')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'available' 
                  ? 'bg-green-500/30 border border-green-400/50 text-green-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setReportType('in-use')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'in-use' 
                  ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              In Use
            </button>
            <button
              onClick={() => setReportType('maintenance')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'maintenance' 
                  ? 'bg-yellow-500/30 border border-yellow-400/50 text-yellow-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setReportType('retired')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'retired' 
                  ? 'bg-red-500/30 border border-red-400/50 text-red-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Retired
            </button>
            <button
              onClick={() => setReportType('warehouse')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'warehouse' 
                  ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Warehouse
            </button>
            <button
              onClick={() => setReportType('project')}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                reportType === 'project' 
                  ? 'bg-indigo-500/30 border border-indigo-400/50 text-indigo-300' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Project Site
            </button>
          </div>
        </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-teal-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Total Tools</p>
                  <p className="text-3xl font-bold text-teal-400">{statusStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
                  <div className="h-5 w-5 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Available</p>
                  <p className="text-3xl font-bold text-green-400">{statusStats.available}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                  <div className="h-5 w-5 bg-blue-400 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wider">In Use</p>
                  <p className="text-3xl font-bold text-blue-400">{statusStats.inUse}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-400/30">
                  <div className="h-5 w-5 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Maintenance</p>
                  <p className="text-3xl font-bold text-yellow-400">{statusStats.maintenance}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tools List */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 mb-6">
            <div className="px-6 lg:px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
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
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 backdrop-blur-md border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Asset Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                      Purchase Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTools.map((tool, index) => (
                    <tr key={tool._id} className={`hover:bg-white/10 transition-colors ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {tool.assetnumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {tool.toolDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          tool.toolStatus === 'Available' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          tool.toolStatus === 'In Use' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          tool.toolStatus === 'Maintenance' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                          'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}>
                          {tool.toolStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {tool.toolLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {tool.toolCost ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'SAR'
                        }).format(tool.toolCost) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                        {tool.purchasedDate ? new Date(tool.purchasedDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Available:</span>
                    <span className="text-sm font-semibold text-green-400">{statusStats.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">In Use:</span>
                    <span className="text-sm font-semibold text-blue-400">{statusStats.inUse}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Maintenance:</span>
                    <span className="text-sm font-semibold text-yellow-400">{statusStats.maintenance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Retired:</span>
                    <span className="text-sm font-semibold text-red-400">{statusStats.retired}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Location Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Warehouse:</span>
                    <span className="text-sm font-semibold text-teal-400">{locationStats.warehouse}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Project Site:</span>
                    <span className="text-sm font-semibold text-teal-400">{locationStats.projectSite}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Maintenance:</span>
                    <span className="text-sm font-semibold text-teal-400">{locationStats.maintenance}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Total Value:</span>
                    <span className="text-sm font-semibold text-teal-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'SAR'
                      }).format(totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Average Cost:</span>
                    <span className="text-sm font-semibold text-teal-400">
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
    </div>
  );
}
