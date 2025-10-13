'use client';

import { useState, useEffect } from 'react';
import { PPEIssueRecord } from '@/types/ppe';
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
  remarks: string;
}

interface ItemRow {
  ppeId: string;
  ppeName: string;
  quantityIssued: number;
  isFirstIssue: boolean;
  issueAgainstDue: boolean;
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
    remarks: ''
  });
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
    { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
    { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
  ]);
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
    const validRows = itemRows.filter(r => r.ppeId && r.quantityIssued > 0);
    if (validRows.length === 0) {
      show({ title: 'No items', description: 'Add at least one PPE item row', variant: 'destructive' });
      return;
    }

    try {
      setSubmitLoading(true);
      const isEditing = Boolean(editingRecordId);
      if (isEditing) {
        const r = validRows[0];
        const response = await fetch(`/api/ppe-records/${editingRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmpNumber: formData.userEmpNumber,
            userEmpName: formData.userEmpName,
            dateOfIssue: formData.dateOfIssue,
            ppeId: r.ppeId,
            ppeName: r.ppeName,
            quantityIssued: r.quantityIssued,
            isFirstIssue: r.isFirstIssue,
            issueAgainstDue: r.issueAgainstDue,
            remarks: formData.remarks,
          }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to update record');
        show({ title: 'PPE issue updated', description: 'Record updated successfully', variant: 'success' });
      } else {
        let created = 0;
        for (const r of validRows) {
          const res = await fetch('/api/ppe-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmpNumber: formData.userEmpNumber,
              userEmpName: formData.userEmpName,
              dateOfIssue: formData.dateOfIssue,
              ppeId: r.ppeId,
              ppeName: r.ppeName,
              quantityIssued: r.quantityIssued,
              isFirstIssue: r.isFirstIssue,
              issueAgainstDue: r.issueAgainstDue,
              remarks: formData.remarks,
            }),
          });
          const js = await res.json();
          if (!js.success) throw new Error(js.error || 'Failed to create some records');
          created += 1;
        }
        show({ title: 'PPE issued', description: `Created ${created} issue record(s)`, variant: 'success' });
      }

      setActiveTab('list');
      setEditingRecordId(null);
      setFormData({
        userEmpNumber: '',
        userEmpName: '',
        dateOfIssue: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setItemRows([
        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
      ]);
      fetchData();
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
      remarks: record.remarks || ''
    });
    setItemRows([{
      ppeId: record.ppeId,
      ppeName: record.ppeName,
      quantityIssued: record.quantityIssued,
      isFirstIssue: record.isFirstIssue,
      issueAgainstDue: record.issueAgainstDue,
    }]);
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

  // Row handlers
  const updateRowPPE = (index: number, ppeId: string, ppeName: string) => {
    setItemRows(prev => prev.map((r, i) => i === index ? { ...r, ppeId, ppeName } : r));
  };
  const updateRowQty = (index: number, qty: number) => {
    setItemRows(prev => prev.map((r, i) => i === index ? { ...r, quantityIssued: qty } : r));
  };
  const updateRowFlag = (index: number, key: 'isFirstIssue' | 'issueAgainstDue', value: boolean) => {
    setItemRows(prev => prev.map((r, i) => i === index ? { ...r, [key]: value } as ItemRow : r));
  };
  const addRow = () => {
    setItemRows(prev => [...prev, { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true }]);
  };
  const removeRow = (index: number) => {
    setItemRows(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
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
                    <label className="block text-sm font-medium mb-1">Issue Date *</label>
                    <Input
                      type="date"
                      value={formData.dateOfIssue}
                      onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50/50">
                          <th className="text-left p-2">PPE Item</th>
                          <th className="text-left p-2">Quantity</th>
                          <th className="text-left p-2">First Issue</th>
                          <th className="text-left p-2">Issue Against Due</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemRows.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2 min-w-[260px]">
                              <SearchablePPESelect
                                value={row.ppeId}
                                onChange={(id, name) => updateRowPPE(idx, id, name)}
                                placeholder="Search PPE by name or ID..."
                                required
                              />
                            </td>
                            <td className="p-2 w-[140px]">
                              <Input type="number" min="1" value={row.quantityIssued}
                                onChange={(e) => updateRowQty(idx, parseInt(e.target.value || '0'))} />
                            </td>
                            <td className="p-2 w-[160px]">
                              <label className="inline-flex items-center gap-2">
                                <input type="checkbox" className="rounded" checked={row.isFirstIssue}
                                  onChange={(e) => updateRowFlag(idx, 'isFirstIssue', e.target.checked)} />
                                <span>Yes</span>
                              </label>
                            </td>
                            <td className="p-2 w-[220px]">
                              <label className="inline-flex items-center gap-2">
                                <input type="checkbox" className="rounded" checked={row.issueAgainstDue}
                                  onChange={(e) => updateRowFlag(idx, 'issueAgainstDue', e.target.checked)} />
                                <span>Due (uncheck for damage)</span>
                              </label>
                            </td>
                            <td className="p-2 w-[140px]">
                              <Button type="button" variant="outline" onClick={() => removeRow(idx)} disabled={itemRows.length <= 1}>Remove</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <Button type="button" variant="outline" onClick={addRow}>+ Add row</Button>
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
                        remarks: ''
                      });
                      setItemRows([
                        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
                        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
                        { ppeId: '', ppeName: '', quantityIssued: 1, isFirstIssue: true, issueAgainstDue: true },
                      ]);
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
