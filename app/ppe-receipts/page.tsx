'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveTable from '@/components/ui/responsive-table';
import SearchablePPESelect from '@/components/SearchablePPESelect';
import { PPEReceipt } from '@/types/ppe';

interface PPEReceiptFormData {
  ppeId: string;
  ppeName: string;
  dateOfReceipt: string;
  quantityReceived: number;
  remarks: string;
}

export default function PPEReceiptsPage() {
  const [receiptRecords, setReceiptRecords] = useState<PPEReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState<PPEReceiptFormData>({
    ppeId: '',
    ppeName: '',
    dateOfReceipt: new Date().toISOString().split('T')[0],
    quantityReceived: 1,
    remarks: ''
  });
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ppe-receipts');
      const result = await response.json();
      
      if (result.success) {
        setReceiptRecords(result.data);
      } else {
        console.error('Error fetching receipts:', result.error);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current stock for selected PPE
  const fetchCurrentStock = async (ppeId: string) => {
    if (!ppeId) return;
    
    try {
      setStockLoading(true);
      const response = await fetch(`/api/ppe-current-stock/${ppeId}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentStock(result.data.currentStock);
      } else {
        setCurrentStock(null);
      }
    } catch (error) {
      console.error('Error fetching current stock:', error);
      setCurrentStock(null);
    } finally {
      setStockLoading(false);
    }
  };

  // Handle PPE selection change
  const handlePPESelection = (ppeId: string, ppeName: string) => {
    setFormData({ ...formData, ppeId, ppeName });
    fetchCurrentStock(ppeId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/ppe-receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActiveTab('list');
        setFormData({
          ppeId: '',
          ppeName: '',
          dateOfReceipt: new Date().toISOString().split('T')[0],
          quantityReceived: 1,
          remarks: ''
        });
        setCurrentStock(null);
        fetchData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert('Error creating receipt');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter receipts based on search term
  const filteredReceipts = receiptRecords.filter(receipt =>
    receipt.ppeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.ppeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receivedByName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns for receipts
  const receiptColumns = [
    { key: 'ppeId', label: 'PPE ID' },
    { key: 'ppeName', label: 'PPE Name' },
    { key: 'dateOfReceipt', label: 'Date of Receipt', type: 'date' },
    { key: 'quantityReceived', label: 'Quantity Received', type: 'number' },
    { key: 'receivedByName', label: 'Received By' },
    { key: 'remarks', label: 'Remarks' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">PPE Receipts</h1>
        <p className="text-gray-600 mt-2">Manage PPE receipt records when new stock arrives</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Receipt Records</TabsTrigger>
          <TabsTrigger value="new">New Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Records</CardTitle>
              <div className="flex gap-4 mt-4">
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading receipts...</div>
              ) : (
                <ResponsiveTable
                  data={filteredReceipts}
                  columns={receiptColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New PPE Receipt</CardTitle>
              <p className="text-sm text-gray-600">Record receipt of new PPE stock</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Current Stock:</strong> {stockLoading ? 'Loading...' : currentStock} units
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        After receipt: {currentStock + formData.quantityReceived} units
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Receipt *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfReceipt}
                    onChange={(e) => setFormData({ ...formData, dateOfReceipt: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity Received *
                  </label>
                  <Input
                    type="number"
                    value={formData.quantityReceived}
                    onChange={(e) => setFormData({ ...formData, quantityReceived: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    placeholder="Enter quantity received"
                  />
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
                    placeholder="Enter any remarks about this receipt..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Record Receipt
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('list');
                      setFormData({
                        ppeId: '',
                        ppeName: '',
                        dateOfReceipt: new Date().toISOString().split('T')[0],
                        quantityReceived: 1,
                        remarks: ''
                      });
                      setCurrentStock(null);
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
