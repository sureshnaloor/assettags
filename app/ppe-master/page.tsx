'use client';

import { useState, useEffect } from 'react';
import { PPEMaster } from '@/types/ppe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTable from '@/components/ui/responsive-table';

interface PPEFormData {
  ppeId: string;
  ppeName: string;
  materialCode: string;
  life: number;
  lifeUOM: 'week' | 'month' | 'year';
  description: string;
  category: string;
  initialStock: number;
}

export default function PPEMasterPage() {
  const [ppeRecords, setPPERecords] = useState<PPEMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingPPE, setEditingPPE] = useState<PPEMaster | null>(null);
  const [formData, setFormData] = useState<PPEFormData>({
    ppeId: '',
    ppeName: '',
    materialCode: '',
    life: 0,
    lifeUOM: 'month',
    description: '',
    category: '',
    initialStock: 0
  });

  // Fetch PPE records
  const fetchPPERecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ppe-master?search=${searchTerm}`);
      const result = await response.json();
      
      if (result.success) {
        setPPERecords(result.data.records);
      } else {
        console.error('Failed to fetch PPE records:', result.error);
      }
    } catch (error) {
      console.error('Error fetching PPE records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPPERecords();
  }, [searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPPE ? `/api/ppe-master/${editingPPE.ppeId}` : '/api/ppe-master';
      const method = editingPPE ? 'PUT' : 'POST';
      
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
        setEditingPPE(null);
        setFormData({
          ppeId: '',
          ppeName: '',
          materialCode: '',
          life: 0,
          lifeUOM: 'month',
          description: '',
          category: '',
          initialStock: 0
        });
        fetchPPERecords();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving PPE record:', error);
      alert('Failed to save PPE record');
    }
  };

  // Handle edit
  const handleEdit = (ppe: PPEMaster) => {
    setEditingPPE(ppe);
    setFormData({
      ppeId: ppe.ppeId,
      ppeName: ppe.ppeName,
      materialCode: ppe.materialCode,
      life: ppe.life,
      lifeUOM: ppe.lifeUOM,
      description: ppe.description || '',
      category: ppe.category || '',
      initialStock: 0 // Don't show initial stock when editing
    });
    setActiveTab('form');
  };

  // Handle delete
  const handleDelete = async (ppeId: string) => {
    if (!confirm('Are you sure you want to delete this PPE record?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ppe-master/${ppeId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchPPERecords();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting PPE record:', error);
      alert('Failed to delete PPE record');
    }
  };

  // Table columns
  const columns = [
    { key: 'ppeId', label: 'PPE ID' },
    { key: 'ppeName', label: 'PPE Name' },
    { key: 'materialCode', label: 'Material Code' },
    { key: 'life', label: 'Life' },
    { key: 'lifeUOM', label: 'UOM' },
    { key: 'category', label: 'Category' },
    { key: 'isActive', label: 'Active' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = ppeRecords.map(ppe => ({
    ...ppe,
    life: `${ppe.life} ${ppe.lifeUOM}`,
    isActive: ppe.isActive ? 'Yes' : 'No',
    actions: (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleEdit(ppe)}>
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => handleDelete(ppe.ppeId)}
        >
          Delete
        </Button>
      </div>
    )
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">PPE Master Management</h1>
        <p className="text-gray-600">Manage Personal Protective Equipment master data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">PPE List</TabsTrigger>
          <TabsTrigger value="form">
            {editingPPE ? 'Edit PPE' : 'Add New PPE'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>PPE Master Records</CardTitle>
              <div className="flex gap-4">
                <Input
                  placeholder="Search PPE records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => setActiveTab('form')}>
                  Add New PPE
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
                {editingPPE ? 'Edit PPE Record' : 'Add New PPE Record'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PPE ID *
                    </label>
                    <Input
                      value={formData.ppeId}
                      onChange={(e) => setFormData({ ...formData, ppeId: e.target.value })}
                      required
                      disabled={!!editingPPE}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PPE Name *
                    </label>
                    <Input
                      value={formData.ppeName}
                      onChange={(e) => setFormData({ ...formData, ppeName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Material Code *
                    </label>
                    <Input
                      value={formData.materialCode}
                      onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Life *
                    </label>
                    <Input
                      type="number"
                      value={formData.life}
                      onChange={(e) => setFormData({ ...formData, life: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Life UOM *
                    </label>
                    <select
                      value={formData.lifeUOM}
                      onChange={(e) => setFormData({ ...formData, lifeUOM: e.target.value as 'week' | 'month' | 'year' })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                  
                  {!editingPPE && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Initial Stock *
                      </label>
                      <Input
                        type="number"
                        value={formData.initialStock}
                        onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
                        required
                        min="0"
                        placeholder="Enter initial stock quantity"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit">
                    {editingPPE ? 'Update PPE' : 'Create PPE'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('list');
                      setEditingPPE(null);
                      setFormData({
                        ppeId: '',
                        ppeName: '',
                        materialCode: '',
                        life: 0,
                        lifeUOM: 'month',
                        description: '',
                        category: '',
                        initialStock: 0
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
