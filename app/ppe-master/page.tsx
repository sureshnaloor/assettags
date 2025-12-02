'use client';

import { useState, useEffect, useRef } from 'react';
import { PPEMaster } from '@/types/ppe';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

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
        <button
          onClick={() => handleEdit(ppe)}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(ppe.ppeId)}
          className="px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    )
  }));

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
                PPE Master Management
              </h1>
              <p className="text-white text-lg">Manage Personal Protective Equipment master data</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-1 shadow-lg mb-6">
              <TabsTrigger 
                className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 transition-all duration-300" 
                value="list"
              >
                PPE List
              </TabsTrigger>
              <TabsTrigger 
                className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 transition-all duration-300" 
                value="form"
              >
                {editingPPE ? 'Edit PPE' : 'Add New PPE'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="p-6 lg:p-8 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-white">PPE Master Records</h2>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Search PPE records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                      />
                      <button
                        onClick={() => setActiveTab('form')}
                        className="px-6 py-2 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300 text-sm"
                      >
                        Add New PPE
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
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="p-6 lg:p-8 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">
                    {editingPPE ? 'Edit PPE Record' : 'Add New PPE Record'}
                  </h2>
                </div>
                <div className="p-6 lg:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          PPE ID *
                        </label>
                        <input
                          type="text"
                          value={formData.ppeId}
                          onChange={(e) => setFormData({ ...formData, ppeId: e.target.value })}
                          required
                          disabled={!!editingPPE}
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          PPE Name *
                        </label>
                        <input
                          type="text"
                          value={formData.ppeName}
                          onChange={(e) => setFormData({ ...formData, ppeName: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Material Code *
                        </label>
                        <input
                          type="text"
                          value={formData.materialCode}
                          onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Category
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Life *
                        </label>
                        <input
                          type="number"
                          value={formData.life}
                          onChange={(e) => setFormData({ ...formData, life: parseInt(e.target.value) })}
                          required
                          min="1"
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Life UOM *
                        </label>
                        <select
                          value={formData.lifeUOM}
                          onChange={(e) => setFormData({ ...formData, lifeUOM: e.target.value as 'week' | 'month' | 'year' })}
                          className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                          required
                        >
                          <option value="week" className="bg-[#1a2332]">Week</option>
                          <option value="month" className="bg-[#1a2332]">Month</option>
                          <option value="year" className="bg-[#1a2332]">Year</option>
                        </select>
                      </div>
                      
                      {!editingPPE && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Initial Stock *
                          </label>
                          <input
                            type="number"
                            value={formData.initialStock}
                            onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
                            required
                            min="0"
                            placeholder="Enter initial stock quantity"
                            className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-xl text-teal-300 font-semibold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-300"
                      >
                        {editingPPE ? 'Update PPE' : 'Create PPE'}
                      </button>
                      <button
                        type="button"
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
