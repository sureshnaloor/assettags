'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/ppe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTable from '@/components/ui/responsive-table';
import PPEIssuesByEmployee from '@/components/PPEIssuesByEmployee';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await fetch(`/api/employees?search=${searchTerm}`);
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
  }, [searchTerm]);

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
        <Button size="sm" onClick={() => handleEdit(emp)}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEmployeeSelect(emp)}>
          View PPE Records
        </Button>
        {emp.active !== 'N' && (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => handleDeactivate(emp.empno)}
          >
            Deactivate
          </Button>
        )}
      </div>
    )
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-gray-600">Manage employee information and status</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="form">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </TabsTrigger>
          {selectedEmployee && (
            <TabsTrigger value="ppe-records">PPE Records</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Employee Records</CardTitle>
              <div className="flex gap-4">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => setActiveTab('form')}>
                  Add New Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <ResponsiveTable columns={columns} data={tableData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Employee Number *
                    </label>
                    <Input
                      value={formData.empno}
                      onChange={(e) => setFormData({ ...formData, empno: e.target.value })}
                      required
                      disabled={!!editingEmployee}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Employee Name *
                    </label>
                    <Input
                      value={formData.empname}
                      onChange={(e) => setFormData({ ...formData, empname: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Designation
                    </label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  {editingEmployee && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.value as 'Y' | 'N' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Y">Active</option>
                        <option value="N">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit">
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
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ppe-records">
          <Card>
            <CardHeader>
              <CardTitle>
                PPE Records - {selectedEmployee?.empname} ({selectedEmployee?.empno})
              </CardTitle>
              <p className="text-gray-600">
                View complete PPE issue history for the selected employee
              </p>
            </CardHeader>
            <CardContent>
              {selectedEmployee && (
                <PPEIssuesByEmployee 
                  showSearch={false}
                  preSelectedEmployee={selectedEmployee}
                  onEmployeeSelect={setSelectedEmployee}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
