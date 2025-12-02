'use client';

import { useState, useEffect, useRef } from 'react';
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
  reservationNumber: string;
  fileReferenceNumber: string;
  remarks: string;
}

interface ItemRow {
  ppeId: string;
  ppeName: string;
  quantityIssued: number;
  size: string;
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
    reservationNumber: '',
    fileReferenceNumber: '',
    remarks: ''
  });
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
    { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
    { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const { show } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

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
            reservationNumber: formData.reservationNumber,
            fileReferenceNumber: formData.fileReferenceNumber,
            ppeId: r.ppeId,
            ppeName: r.ppeName,
            quantityIssued: r.quantityIssued,
            size: r.size,
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
              reservationNumber: formData.reservationNumber,
              fileReferenceNumber: formData.fileReferenceNumber,
              ppeId: r.ppeId,
              ppeName: r.ppeName,
              quantityIssued: r.quantityIssued,
              size: r.size,
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
        reservationNumber: '',
        fileReferenceNumber: '',
        remarks: ''
      });
      setItemRows([
        { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
        { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
        { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
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
    console.log('Editing record:', record); // Debug log
    setEditingRecordId(record._id || null);
    setFormData({
      userEmpNumber: record.userEmpNumber,
      userEmpName: record.userEmpName,
      dateOfIssue: new Date(record.dateOfIssue).toISOString().split('T')[0],
      reservationNumber: (record as any).reservationNumber || '',
      fileReferenceNumber: (record as any).fileReferenceNumber || '',
      remarks: record.remarks || ''
    });
    setItemRows([{
      ppeId: record.ppeId,
      ppeName: record.ppeName,
      quantityIssued: record.quantityIssued,
      size: (record as any).size || '',
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
  const updateRowSize = (index: number, size: string) => {
    setItemRows(prev => prev.map((r, i) => i === index ? { ...r, size } : r));
  };
  const updateRowFlag = (index: number, key: 'isFirstIssue' | 'issueAgainstDue', value: boolean) => {
    setItemRows(prev => prev.map((r, i) => i === index ? { ...r, [key]: value } as ItemRow : r));
  };
  const addRow = () => {
    setItemRows(prev => [...prev, { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true }]);
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
    { key: 'additionalDetails', label: 'Additional Details' },
    { key: 'isFirstIssue', label: 'First Issue' },
    { key: 'issueAgainstDue', label: 'Issue Type' },
    { key: 'issuedByName', label: 'Issued By' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = issueRecords.map(record => {
    // Create combined additional details with colored field names
    const additionalDetails = [];
    
    const reservationNumber = (record as any).reservationNumber;
    if (reservationNumber) {
      additionalDetails.push(
        <span key="reservation">
          <span className="text-teal-300 font-medium">Reservation:</span> <span className="text-white">{reservationNumber}</span>
        </span>
      );
    }
    
    const fileReferenceNumber = (record as any).fileReferenceNumber;
    if (fileReferenceNumber) {
      additionalDetails.push(
        <span key="fileref">
          <span className="text-teal-300 font-medium">File Ref:</span> <span className="text-white">{fileReferenceNumber}</span>
        </span>
      );
    }
    
    const size = (record as any).size;
    if (size) {
      additionalDetails.push(
        <span key="size">
          <span className="text-teal-300 font-medium">Size:</span> <span className="text-white">{size}</span>
        </span>
      );
    }
    
    const remarks = record.remarks;
    if (remarks) {
      additionalDetails.push(
        <span key="remarks">
          <span className="text-teal-300 font-medium">Remarks:</span> <span className="text-white">{remarks}</span>
        </span>
      );
    }
    
    const additionalDetailsElement = additionalDetails.length > 0 
      ? <div className="space-y-1">{additionalDetails.map((item, index) => (
          <div key={index} className="text-xs">
            {item}
          </div>
        ))}</div>
      : <span className="text-white/70">-</span>;

    return {
      ...record,
      dateOfIssue: new Date(record.dateOfIssue).toLocaleDateString(),
      additionalDetails: additionalDetailsElement,
      isFirstIssue: record.isFirstIssue ? 'Yes' : 'No',
      issueAgainstDue: record.issueAgainstDue ? 'Due' : 'Damage',
      actions: (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(record)}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(record)}
            disabled={deleteLoadingId === record._id}
            className="px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoadingId === record._id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )
    };
  });

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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                PPE Issue Records
              </h1>
              <p className="text-white text-lg">Manage Personal Protective Equipment issue records</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-1 shadow-lg mb-6">
              <TabsTrigger 
                className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 transition-all duration-300" 
                value="list"
              >
                Issue Records
              </TabsTrigger>
              <TabsTrigger 
                className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 transition-all duration-300" 
                value="form"
              >
                Issue New PPE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="p-6 lg:p-8 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-white">PPE Issue Records</h2>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Search issue records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                      />
                      <button
                        onClick={() => setActiveTab('form')}
                        className="px-6 py-2 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300 text-sm"
                      >
                        Issue New PPE
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
                      <p className="text-white ml-4">Loading...</p>
                    </div>
                  ) : (
                    <ResponsiveTable columns={columns} data={tableData} variant="glassmorphic" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="form">
              {editingRecordId && (
                <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl">
                  <p className="text-sm text-blue-300">
                    <strong>Edit Mode:</strong> You are editing an existing PPE issue record. The date field is locked and cannot be changed.
                  </p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="p-6 lg:p-8 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">
                    {editingRecordId ? 'Edit PPE Issue Record' : 'Issue PPE to Employee'}
                  </h2>
                </div>
                <div className="p-6 lg:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
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
                        {editingRecordId && formData.userEmpName && (
                          <p className="text-xs text-red-300 mt-2">
                            Existing: {formData.userEmpName} ({formData.userEmpNumber})
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Issue Date *</label>
                        <input
                          type="date"
                          value={formData.dateOfIssue}
                          onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
                          required
                          disabled={!!editingRecordId}
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {editingRecordId && (
                          <p className="text-xs text-white/80 mt-2">Date cannot be changed when editing</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Reservation Number
                        </label>
                        <input
                          type="text"
                          value={formData.reservationNumber}
                          onChange={(e) => setFormData({ ...formData, reservationNumber: e.target.value })}
                          placeholder="Enter reservation number..."
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          File Reference Number
                        </label>
                        <input
                          type="text"
                          value={formData.fileReferenceNumber}
                          onChange={(e) => setFormData({ ...formData, fileReferenceNumber: e.target.value })}
                          placeholder="Enter file reference number..."
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                
                    <div className="mt-4">
                      <div className="overflow-auto rounded-xl border border-white/20 shadow-lg bg-white/5 backdrop-blur-md">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                              <th className="text-left p-3 text-white/90 font-semibold">PPE Item</th>
                              <th className="text-left p-3 text-white/90 font-semibold">Quantity</th>
                              <th className="text-left p-3 text-white/90 font-semibold">Size</th>
                              <th className="text-left p-3 text-white/90 font-semibold">First Issue</th>
                              <th className="text-left p-3 text-white/90 font-semibold">Issue Against Due</th>
                              <th className="text-left p-3 text-white/90 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                <td className="p-3 min-w-[260px]">
                                  <SearchablePPESelect
                                    value={row.ppeId}
                                    onChange={(id, name) => updateRowPPE(idx, id, name)}
                                    placeholder="Search PPE by name or ID..."
                                    required
                                  />
                                  {editingRecordId && row.ppeName && (
                                    <p className="text-xs text-red-300 mt-2">
                                      Existing: {row.ppeName} ({row.ppeId})
                                    </p>
                                  )}
                                </td>
                                <td className="p-3 w-[140px]">
                                  <input
                                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    type="number"
                                    min="1"
                                    value={row.quantityIssued}
                                    onChange={(e) => updateRowQty(idx, parseInt(e.target.value || '0'))}
                                  />
                                </td>
                                <td className="p-3 w-[120px]">
                                  <input
                                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    type="text"
                                    value={row.size}
                                    onChange={(e) => updateRowSize(idx, e.target.value)}
                                    placeholder="Size..."
                                  />
                                </td>
                                <td className="p-3 w-[160px]">
                                  <label className="inline-flex items-center gap-2 text-white">
                                    <input
                                      type="checkbox"
                                      className="rounded w-4 h-4 accent-teal-400"
                                      checked={row.isFirstIssue}
                                      onChange={(e) => updateRowFlag(idx, 'isFirstIssue', e.target.checked)}
                                    />
                                    <span>Yes</span>
                                  </label>
                                </td>
                                <td className="p-3 w-[220px]">
                                  <label className="inline-flex items-center gap-2 text-white">
                                    <input
                                      type="checkbox"
                                      className="rounded w-4 h-4 accent-teal-400"
                                      checked={row.issueAgainstDue}
                                      onChange={(e) => updateRowFlag(idx, 'issueAgainstDue', e.target.checked)}
                                    />
                                    <span>Due (uncheck for damage)</span>
                                  </label>
                                </td>
                                <td className="p-3 w-[140px]">
                                  <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    disabled={itemRows.length <= 1}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addRow}
                          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
                        >
                          + Add row
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">
                        Remarks
                      </label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        rows={3}
                        placeholder="Enter any remarks or notes..."
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="px-6 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (editingRecordId ? 'Updating...' : 'Submitting...') : (editingRecordId ? 'Update Issue' : 'Issue PPE')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('list');
                          setEditingRecordId(null);
                          setFormData({
                            userEmpNumber: '',
                            userEmpName: '',
                            dateOfIssue: new Date().toISOString().split('T')[0],
                            reservationNumber: '',
                            fileReferenceNumber: '',
                            remarks: ''
                          });
                          setItemRows([
                            { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
                            { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
                            { ppeId: '', ppeName: '', quantityIssued: 1, size: '', isFirstIssue: true, issueAgainstDue: true },
                          ]);
                        }}
                        className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
