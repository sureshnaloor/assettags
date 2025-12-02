'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import DatePicker from 'react-datepicker';
import { Employee, Project, Custody } from '@/types/custody';

// Add proper type definition for params
// Remove this interface as we'll use useParams
interface PageProps {
  params: {
    assetnumber: string;
  };
}

// Update the component definition
export default function NewCustodyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  const router = useRouter();
  const params = useParams() as { assetnumber: string };
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [locationType, setLocationType] = useState<'warehouse' | 'department' | 'camp/office'>('warehouse');
  
  // Keep only one formData declaration
  const [formData, setFormData] = useState<Partial<Custody>>({
    assetnumber: params.assetnumber,
    locationType: 'warehouse',
    warehouseCity: 'Dammam',
    custodyfrom: new Date(),
    custodyto: null
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
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
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    }
  };

  const loadEmployeeOptions = async (inputValue: string) => {
    // Require minimum 3 characters for name searches, or any length for numeric searches
    if (inputValue.length < 3 && !/^\d+$/.test(inputValue)) return [];
    
    try {
      const url = `/api/employees/search?q=${encodeURIComponent(inputValue)}`;
      console.log('Fetching employees:', { inputValue, url });
      
      const response = await fetch(url);
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', { status: response.status, data: responseData });
        setError(`Failed to fetch employees: ${responseData.error || 'Unknown error'}`);
        return [];
      }
      
      // Handle wrapped response format
      const employees = responseData.success ? responseData.data?.records || [] : [];
      
      console.log('Employees fetched:', employees.length);
      
      return employees.map((emp: Employee) => ({
        value: emp.empno,
        label: `${emp.empno} - ${emp.empname}`,
        employee: emp
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
      setError(`Error: ${errorMessage}`);
      return [];
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!formData.employeenumber || !formData.custodyfrom) {
        setError('Employee and From Date are required');
        return;
      }

      const response = await fetch(`/api/custody/${params.assetnumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdat: new Date(),
          createdby: 'current-user' // Replace with actual user info when auth is implemented
        }),
      });

      if (!response.ok) throw new Error('Failed to save custody record');

      router.back();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save custody record');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      
      <div className="relative z-20 flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-6 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">New Custody Record</h3>
            
            {error && (
              <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm mb-6 border border-red-400/30">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Employee Number
                </label>
                <AsyncSelect
                  loadOptions={loadEmployeeOptions}
                  defaultOptions={false}
                  cacheOptions
                  onChange={(option: { value: string; label: string; employee: Employee } | null) => {
                    if (option) {
                      setFormData(prev => ({
                        ...prev,
                        employeenumber: option.value,
                        employeename: option.employee.empname
                      }));
                    }
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'rgba(26, 35, 50, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      color: 'rgb(255, 255, 255)',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'rgb(255, 255, 255)'
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'rgb(255, 255, 255)'
                    })
                  }}
                  className="text-sm"
                  placeholder="Search by employee number or name..."
                  isClearable
                />
              </div>

              {/* Location Type Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Location Type
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center text-white">
                    <input
                      type="radio"
                      value="warehouse"
                      checked={locationType === 'warehouse'}
                      onChange={(e) => {
                        setLocationType('warehouse');
                        setFormData(prev => ({
                          ...prev,
                          locationType: 'warehouse',
                          warehouseCity: 'Dammam'
                        }));
                      }}
                      className="mr-2"
                    />
                    Warehouse
                  </label>
                  <label className="flex items-center text-white">
                    <input
                      type="radio"
                      value="department"
                      checked={locationType === 'department'}
                      onChange={(e) => {
                        setLocationType('department');
                        setFormData(prev => ({
                          ...prev,
                          locationType: 'department'
                        }));
                      }}
                      className="mr-2"
                    />
                    Department
                  </label>
                  <label className="flex items-center text-white">
                    <input
                      type="radio"
                      value="camp/office"
                      checked={locationType === 'camp/office'}
                      onChange={(e) => {
                        setLocationType('camp/office');
                        setFormData(prev => ({
                          ...prev,
                          locationType: 'camp/office'
                        }));
                      }}
                      className="mr-2"
                    />
                    Camp/Office
                  </label>
                </div>
              </div>

              {/* Conditional Fields based on Location Type */}
              {locationType === 'warehouse' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Warehouse Location
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-white">
                        <input
                          type="radio"
                          value="Dammam"
                          checked={formData.warehouseCity === 'Dammam'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            warehouseCity: 'Dammam'
                          }))}
                          className="mr-2"
                        />
                        Dammam
                      </label>
                      <label className="flex items-center text-white">
                        <input
                          type="radio"
                          value="Jubail"
                          checked={formData.warehouseCity === 'Jubail'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            warehouseCity: 'Jubail'
                          }))}
                          className="mr-2"
                        />
                        Jubail
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Room/Rack/Bin Location
                    </label>
                    <input
                      type="text"
                      value={formData.warehouseLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        warehouseLocation: e.target.value
                      }))}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {locationType === 'department' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Location
                    </label>
                    <select
                      value={formData.departmentLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        departmentLocation: e.target.value
                      }))}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    >
                      <option value="" className="bg-[#1a2332]">Select Location</option>
                      <option value="Dammam">Dammam</option>
                      <option value="Jubail">Jubail</option>
                      <option value="Riyadh">Riyadh</option>
                      <option value="Abha">Abha</option>
                      <option value="Mecca">Mecca</option>
                      <option value="Al-Qassim">Al-Qassim</option>
                      <option value="Al-Ahsa">Al-Ahsa</option>
                      <option value="Al-Baha">Al-Baha</option>
                      <option value="Al-Jouf">Al-Jouf</option>
                      <option value="Al-Madinah">Al-Madinah</option>
                      <option value="Al-Hail">Al-Hail</option>
                      <option value="Al-Kharj">Al-Kharj</option>
                      <option value="Yanbu">Yanbu</option>
                      <option value="Jeddah">Jeddah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Project
                    </label>
                    <Select
                      options={projects.map(proj => ({
                        value: proj.wbs + " - " + proj.projectname,
                        label: `${proj.wbs} - ${proj.projectname}`,
                        project: proj
                      }))}
                      onChange={(option) => {
                        if (option) {
                          setFormData(prev => ({
                            ...prev,
                            project: option.value
                          }));
                        }
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(12px)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        }),
                        menu: (base) => ({
                          ...base,
                          background: 'rgba(26, 35, 50, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          color: 'rgb(255, 255, 255)',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'rgb(255, 255, 255)'
                        }),
                        input: (base) => ({
                          ...base,
                          color: 'rgb(255, 255, 255)'
                        })
                      }}
                      className="text-sm"
                      placeholder="Search by WBS or project name..."
                      isClearable
                      isSearchable
                    />
                  </div>
                </>
              )}

              {locationType === 'camp/office' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Location
                    </label>
                    <select
                      value={formData.departmentLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        departmentLocation: e.target.value
                      }))}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    >
                      <option value="" className="bg-[#1a2332]">Select Location</option>
                      <option value="Dammam">Dammam</option>
                      <option value="Jubail">Jubail</option>
                      <option value="Riyadh">Riyadh</option>
                      <option value="Abha">Abha</option>
                      <option value="Mecca">Mecca</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Building/Room/Occupant
                    </label>
                    <input
                      type="text"
                      value={formData.campOfficeLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        campOfficeLocation: e.target.value
                      }))}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      placeholder="Enter building, room, or occupant details..."
                    />
                  </div>
                </>
              )}

              {/* Custody From Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Custody From Date <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={formData.custodyfrom}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setFormData(prev => ({
                        ...prev,
                        custodyfrom: date
                      }));
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </div>

              {/* Custody To Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Custody To Date
                </label>
                <DatePicker
                  selected={formData.custodyto}
                  onChange={(date: Date | null) => setFormData(prev => ({
                    ...prev,
                    custodyto: date
                  }))}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  minDate={formData.custodyfrom || undefined}
                />
              </div>

              {/* Gatepass Document */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Gatepass Document Number
                </label>
                <input
                  type="text"
                  value={formData.documentnumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentnumber: e.target.value
                  }))}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  placeholder="Enter gatepass document number..."
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/20 pt-6">
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}