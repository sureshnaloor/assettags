'use client';

import { useState, useEffect } from 'react';
import { PPEIssueRecord, PPEMaster, Employee } from '@/types/ppe';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTable from '@/components/ui/responsive-table';
import SearchableEmployeeSelect from '@/components/SearchableEmployeeSelect';
import SearchablePPESelect from '@/components/SearchablePPESelect';

interface PPEIssueFormData {
  userEmpNumber: string;
  userEmpName: string;
  dateOfIssue: string;
  ppeId: string;
  ppeName: string;
  quantityIssued: number;
  isFirstIssue: boolean;
  issueAgainstDue: boolean;
  remarks: string;
}

export default function PPEIssueRecordsPage() {
  const [issueRecords, setIssueRecords] = useState<PPEIssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PPEIssueFormData>({
    userEmpNumber: '',
    userEmpName: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    ppeId: '',
    ppeName: '',
    quantityIssued: 1,
    isFirstIssue: true,
    issueAgainstDue: true,
    remarks: ''
  });
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const { show } = useToast();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch issue records
      const issueResponse = await fetch(`/api/ppe-records?search=${searchTerm}`);
      const issueResult = await issueResponse.json();
      
      if (issueResult.success) {
        setIssueRecords(issueResult.data.records);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check stock availability
    if (currentStock !== null && formData.quantityIssued > currentStock) {
      show({ title: 'Insufficient stock', description: `Available: ${currentStock}, Requested: ${formData.quantityIssued}`, variant: 'destructive' });
      return;
    }
    
    try {
      setSubmitLoading(true);
      const isEditing = Boolean(editingRecordId);
      const url = isEditing ? `/api/ppe-records/${editingRecordId}` : '/api/ppe-records';
      const method = isEditing ? 'PUT' : 'POST';
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
        setEditingRecordId(null);
        show({ title: isEditing ? 'PPE issue updated' : 'PPE issued', description: isEditing ? 'Record updated successfully' : 'Issue record created successfully', variant: 'success' });
        setFormData({
          userEmpNumber: '',
          userEmpName: '',
          dateOfIssue: new Date().toISOString().split('T')[0],
          ppeId: '',
          ppeName: '',
          quantityIssued: 1,
          isFirstIssue: true,
          issueAgainstDue: true,
          remarks: ''
        });
        setCurrentStock(null);
        fetchData();
      } else {
        show({ title: 'Error', description: result.error || 'Operation failed', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error creating PPE issue record:', error);
      show({ title: 'Request failed', description: 'Could not complete the request', variant: 'destructive' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async (record: PPEIssueRecord) => {
    setEditingRecordId(record._id || null);
    setFormData({
      userEmpNumber: record.userEmpNumber,
      userEmpName: record.userEmpName,
      dateOfIssue: new Date(record.dateOfIssue).toISOString().split('T')[0],
      ppeId: record.ppeId,
      ppeName: record.ppeName,
      quantityIssued: record.quantityIssued,
      isFirstIssue: record.isFirstIssue,
      issueAgainstDue: record.issueAgainstDue,
      remarks: record.remarks || ''
    });
    await fetchCurrentStock(record.ppeId);
    setActiveTab('form');
  };

  const handleDelete = async (record: PPEIssueRecord) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this issue record? This will revert stock.');
    if (!confirmDelete || !record._id) return;
    try {
      setDeleteLoadingId(record._id);
      const response = await fetch(`/api/ppe-records/${record._id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        show({ title: 'Record deleted', description: 'Issue record deleted and stock reverted', variant: 'success' });
        fetchData();
      } else {
        show({ title: 'Delete failed', description: result.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error deleting PPE issue record:', error);
      show({ title: 'Request failed', description: 'Failed to delete PPE issue record', variant: 'destructive' });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Fetch current stock for selected PPE
  const fetchCurrentStock = async (ppeId: string) => {
    if (!ppeId) {
      setCurrentStock(null);
      return;
    }
    
    try {
      setStockLoading(true);
      const response = await fetch(`/api/ppe-current-stock/${ppeId}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentStock(result.data.currentStock);
      } else {
        setCurrentStock(0);
      }
    } catch (error) {
      console.error('Error fetching current stock:', error);
      setCurrentStock(0);
    } finally {
      setStockLoading(false);
    }
  };

  // Handle PPE selection change
  const handlePPESelection = (ppeId: string, ppeName: string) => {
    setFormData({ ...formData, ppeId, ppeName });
    fetchCurrentStock(ppeId);
  };

  // Table columns
  const columns = [
    { key: 'dateOfIssue', label: 'Issue Date' },
    { key: 'userEmpNumber', label: 'Emp Number' },
    { key: 'userEmpName', label: 'Employee Name' },
    { key: 'ppeName', label: 'PPE Name' },
    { key: 'quantityIssued', label: 'Quantity' },
    { key: 'isFirstIssue', label: 'First Issue' },
    { key: 'issueAgainstDue', label: 'Issue Type' },
    { key: 'issuedByName', label: 'Issued By' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = issueRecords.map(record => ({
    ...record,
    dateOfIssue: new Date(record.dateOfIssue).toLocaleDateString(),
    isFirstIssue: record.isFirstIssue ? 'Yes' : 'No',
    issueAgainstDue: record.issueAgainstDue ? 'Due' : 'Damage',
    actions: (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleEdit(record)}>Edit</Button>
        <Button variant="destructive" onClick={() => handleDelete(record)} disabled={deleteLoadingId === record._id}>
          {deleteLoadingId === record._id ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    )
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">PPE Issue Records</h1>
        <p className="text-gray-600">Manage Personal Protective Equipment issue records</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Issue Records</TabsTrigger>
          <TabsTrigger value="form">Issue New PPE</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>PPE Issue Records</CardTitle>
              <div className="flex gap-4">
                <Input
                  placeholder="Search issue records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => setActiveTab('form')}>
                  Issue New PPE
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
              <CardTitle>Issue PPE to Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Employee *
                    </label>
                    <SearchableEmployeeSelect
                      value={formData.userEmpNumber}
                      onChange={(empNumber, empName) => {
                        setFormData({
                          ...formData,
                          userEmpNumber: empNumber,
                          userEmpName: empName
                        });
                      }}
                      placeholder="Search employee by name or number..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PPE Item *
                    </label>
                    <SearchablePPESelect
                      value={formData.ppeId}
                      onChange={handlePPESelection}
                      placeholder="Search PPE by name or ID..."
                      required
                    />
                    {currentStock !== null && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Current Stock:</strong> {stockLoading ? 'Loading...' : currentStock} units
                        </p>
                        {currentStock === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ This PPE item is out of stock!
                          </p>
                        )}
                        {currentStock > 0 && currentStock <= 10 && (
                          <p className="text-sm text-orange-600 mt-1">
                            ⚠️ Low stock warning (≤10 units)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Issue Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfIssue}
                      onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      value={formData.quantityIssued}
                      onChange={(e) => setFormData({ ...formData, quantityIssued: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isFirstIssue}
                        onChange={(e) => setFormData({ ...formData, isFirstIssue: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">First Issue</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.issueAgainstDue}
                        onChange={(e) => setFormData({ ...formData, issueAgainstDue: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Issue Against Due (uncheck for damage)</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter any remarks or notes..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? (editingRecordId ? 'Updating...' : 'Submitting...') : (editingRecordId ? 'Update Issue' : 'Issue PPE')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('list');
                      setEditingRecordId(null);
                      setFormData({
                        userEmpNumber: '',
                        userEmpName: '',
                        dateOfIssue: new Date().toISOString().split('T')[0],
                        ppeId: '',
                        ppeName: '',
                        quantityIssued: 1,
                        isFirstIssue: true,
                        issueAgainstDue: true,
                        remarks: ''
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
      </Tabs>
    </div>
  );
}
