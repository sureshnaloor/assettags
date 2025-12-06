'use client';

import { useState, useEffect, useRef } from 'react';
import { Employee } from '@/types/ppe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTable from '@/components/ui/responsive-table';
import PPEIssuesByEmployee from '@/components/PPEIssuesByEmployee';
import { useAppTheme } from '@/app/contexts/ThemeContext';

interface EmployeeFormData {
  empno: string;
  empname: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  active: 'Y' | 'N';
}

export default function EmployeeManagementPage() {
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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empNumberSearch, setEmpNumberSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    empno: '',
    empname: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    active: 'Y'
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // If employee number is provided, search only by employee number
      if (empNumberSearch.trim()) {
        params.append('search', empNumberSearch.trim());
        params.append('empno_only', 'true'); // Custom parameter to indicate employee number only search
      } else if (searchTerm.trim()) {
        // If general search term is provided, use it
        params.append('search', searchTerm.trim());
      }
      
      const response = await fetch(`/api/employees?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setEmployees(result.data.records);
      } else {
        console.error('Failed to fetch employees:', result.error);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, empNumberSearch]);

  // Theme-based styling function
  const getBackgroundStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]',
          headerBg: 'bg-white/10 backdrop-blur-lg border border-white/20',
          headerTitle: 'bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent',
          headerSubtitle: 'text-white/80',
          tabsBg: 'bg-white/10 backdrop-blur-lg border border-white/20',
          tabsTrigger: 'data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70',
          cardBg: 'bg-white/10 backdrop-blur-lg border border-white/20',
          cardTitle: 'text-white',
          inputBg: 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:ring-teal-400',
          inputDisabled: 'disabled:opacity-50',
          buttonPrimary: 'bg-teal-500 hover:bg-teal-600 text-white',
          buttonSecondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
          buttonDestructive: 'bg-red-500 hover:bg-red-600 text-white',
          selectBg: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
          selectOption: 'bg-[#1a2332]',
          spinnerColor: 'border-teal-400',
          loadingText: 'text-white',
          labelText: 'text-white',
          searchInfo: 'text-white/80'
        };
      case 'light':
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100',
          headerBg: 'bg-white border-2 border-blue-200 shadow-lg',
          headerTitle: 'bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent',
          headerSubtitle: 'text-gray-700',
          tabsBg: 'bg-white border-2 border-blue-200 shadow-md',
          tabsTrigger: 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-600',
          cardBg: 'bg-white border-2 border-blue-200 shadow-md',
          cardTitle: 'text-gray-900',
          inputBg: 'bg-white border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
          inputDisabled: 'disabled:opacity-50',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500',
          buttonSecondary: 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200',
          buttonDestructive: 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500',
          selectBg: 'bg-white border-2 border-blue-300 text-gray-900',
          selectOption: 'bg-white',
          spinnerColor: 'border-blue-500',
          loadingText: 'text-gray-700',
          labelText: 'text-gray-900',
          searchInfo: 'text-gray-600'
        };
      default: // dark theme
        return {
          container: 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
          headerBg: 'bg-slate-800/90 border border-slate-700 shadow-xl',
          headerTitle: 'bg-gradient-to-r from-slate-100 to-teal-400 bg-clip-text text-transparent',
          headerSubtitle: 'text-slate-300',
          tabsBg: 'bg-slate-800/90 border border-slate-700 shadow-xl',
          tabsTrigger: 'data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400',
          cardBg: 'bg-slate-800/90 border border-slate-700 shadow-xl',
          cardTitle: 'text-slate-100',
          inputBg: 'bg-slate-800/90 border border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-teal-400 focus:border-teal-400',
          inputDisabled: 'disabled:opacity-50',
          buttonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-500',
          buttonSecondary: 'bg-slate-700/50 border border-slate-600 text-slate-200 hover:bg-slate-600',
          buttonDestructive: 'bg-red-600 hover:bg-red-700 text-white border border-red-500',
          selectBg: 'bg-slate-800/90 border border-slate-600 text-slate-100',
          selectOption: 'bg-slate-800',
          spinnerColor: 'border-teal-400',
          loadingText: 'text-slate-300',
          labelText: 'text-slate-200',
          searchInfo: 'text-slate-400'
        };
    }
  };

  const backgroundStyles = getBackgroundStyles();

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
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 * (1 - distance / 100)})`;
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.empno}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActiveTab('list');
        setEditingEmployee(null);
        setFormData({
          empno: '',
          empname: '',
          department: '',
          designation: '',
          email: '',
          phone: '',
          active: 'Y'
        });
        fetchEmployees();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    }
  };

  // Handle edit
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      empno: employee.empno,
      empname: employee.empname,
      department: employee.department || '',
      designation: employee.designation || '',
      email: employee.email || '',
      phone: employee.phone || '',
      active: employee.active || 'Y'
    });
    setActiveTab('form');
  };

  // Handle employee selection for PPE records
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('ppe-records');
  };

  // Handle deactivate
  const handleDeactivate = async (empno: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/employees/${empno}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchEmployees();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deactivating employee:', error);
      alert('Failed to deactivate employee');
    }
  };

  // Table columns
  const columns = [
    { key: 'empno', label: 'Employee Number' },
    { key: 'empname', label: 'Employee Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'active', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = employees.map(emp => ({
    ...emp,
    active: emp.active === 'N' ? 'Inactive' : 'Active',
    actions: (
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleEdit(emp)}
          className={backgroundStyles.buttonPrimary}
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleEmployeeSelect(emp)}
          className={backgroundStyles.buttonSecondary}
        >
          View PPE Records
        </Button>
        {emp.active !== 'N' && (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => handleDeactivate(emp.empno)}
            className={backgroundStyles.buttonDestructive}
          >
            Deactivate
          </Button>
        )}
      </div>
    )
  }));

  return (
    <div className={backgroundStyles.container}>
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      {/* Main content */}
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
        {/* Header Section */}
        <div className={`${backgroundStyles.headerBg} rounded-2xl p-6 shadow-xl`}>
          <h1 className={`text-4xl font-bold ${backgroundStyles.headerTitle} mb-2`}>
            Employee Management
          </h1>
          <p className={`${backgroundStyles.headerSubtitle} text-lg`}>Manage employee information and status</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`${backgroundStyles.tabsBg} rounded-xl p-1`}>
            <TabsTrigger 
              value="list"
              className={backgroundStyles.tabsTrigger}
            >
              Employee List
            </TabsTrigger>
            <TabsTrigger 
              value="form"
              className={backgroundStyles.tabsTrigger}
            >
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </TabsTrigger>
            {selectedEmployee && (
              <TabsTrigger 
                value="ppe-records"
                className={backgroundStyles.tabsTrigger}
              >
                PPE Records
              </TabsTrigger>
            )}
          </TabsList>

        <TabsContent value="list">
          <div className={`${backgroundStyles.cardBg} rounded-2xl p-6 shadow-xl`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-semibold ${backgroundStyles.cardTitle} mb-4`}>Employee Records</h2>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by employee number..."
                      value={empNumberSearch}
                      onChange={(e) => {
                        setEmpNumberSearch(e.target.value);
                        // Clear general search when employee number is entered
                        if (e.target.value.trim()) {
                          setSearchTerm('');
                        }
                      }}
                      className={`max-w-sm ${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    />
                    {empNumberSearch && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEmpNumberSearch('')}
                        className={backgroundStyles.buttonSecondary}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name, department, designation..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        // Clear employee number search when general search is entered
                        if (e.target.value.trim()) {
                          setEmpNumberSearch('');
                        }
                      }}
                      className={`max-w-sm ${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className={backgroundStyles.buttonSecondary}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={() => setActiveTab('form')}
                    className={backgroundStyles.buttonPrimary}
                  >
                    Add New Employee
                  </Button>
                  {(empNumberSearch || searchTerm) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEmpNumberSearch('');
                        setSearchTerm('');
                      }}
                      className={backgroundStyles.buttonSecondary}
                    >
                      Show All
                    </Button>
                  )}
                </div>
                {(empNumberSearch || searchTerm) && (
                  <div className={`text-sm ${backgroundStyles.searchInfo}`}>
                    {empNumberSearch ? 
                      `Searching by employee number: "${empNumberSearch}"` : 
                      `Searching by name/department/designation: "${searchTerm}"`
                    }
                  </div>
                )}
              </div>
            </div>
            <div>
              {loading ? (
                <div className={`text-center py-8 ${backgroundStyles.loadingText}`}>
                  <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${backgroundStyles.spinnerColor} mx-auto`}></div>
                </div>
              ) : (
                <ResponsiveTable columns={columns} data={tableData} variant={theme === 'light' ? 'light' : 'glassmorphic'} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="form">
          <div className={`${backgroundStyles.cardBg} rounded-2xl p-6 shadow-xl`}>
            <h2 className={`text-2xl font-semibold ${backgroundStyles.cardTitle} mb-6`}>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Employee Number *
                  </label>
                  <Input
                    value={formData.empno}
                    onChange={(e) => setFormData({ ...formData, empno: e.target.value })}
                    required
                    disabled={!!editingEmployee}
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${backgroundStyles.inputDisabled}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Employee Name *
                  </label>
                  <Input
                    value={formData.empname}
                    onChange={(e) => setFormData({ ...formData, empname: e.target.value })}
                    required
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Department
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Designation
                  </label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`${backgroundStyles.inputBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                
                {editingEmployee && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${backgroundStyles.labelText}`}>
                      Status
                    </label>
                    <select
                      value={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value as 'Y' | 'N' })}
                      className={`w-full px-4 py-2 ${backgroundStyles.selectBg} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    >
                      <option value="Y" className={backgroundStyles.selectOption}>Active</option>
                      <option value="N" className={backgroundStyles.selectOption}>Inactive</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="submit"
                  className={backgroundStyles.buttonPrimary}
                >
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab('list');
                    setEditingEmployee(null);
                    setFormData({
                      empno: '',
                      empname: '',
                      department: '',
                      designation: '',
                      email: '',
                      phone: '',
                      active: 'Y'
                    });
                  }}
                  className={backgroundStyles.buttonSecondary}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="ppe-records">
          <div className={`${backgroundStyles.cardBg} rounded-2xl p-6 shadow-xl`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-semibold ${backgroundStyles.cardTitle} mb-2`}>
                PPE Records - {selectedEmployee?.empname} ({selectedEmployee?.empno})
              </h2>
              <p className={backgroundStyles.headerSubtitle}>
                View complete PPE issue history for the selected employee
              </p>
            </div>
            <div>
              {selectedEmployee && (
                <PPEIssuesByEmployee 
                  showSearch={false}
                  preSelectedEmployee={selectedEmployee}
                  onEmployeeSelect={setSelectedEmployee}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
