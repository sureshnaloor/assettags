'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import DatePicker from 'react-datepicker';
import { Employee, Project, Custody } from '@/types/custody';

export default function NewCustodyPage() {
  const router = useRouter();
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [locationType, setLocationType] = useState<'warehouse' | 'department'>('warehouse');
  
  const [formData, setFormData] = useState<Partial<Custody>>({
    assetnumber: params.assetnumber as string,
    locationType: 'warehouse',
    warehouseCity: 'Dammam',
    custodyfrom: new Date(),
    custodyto: null
  });

  useEffect(() => {
    fetchProjects();
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
    if (inputValue.length < 2) return [];
    
    try {
      const response = await fetch(`/api/employees/search?q=${encodeURIComponent(inputValue)}`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const employees = await response.json();
      return employees.map((emp: Employee) => ({
        value: emp.empno,
        label: `${emp.empno} - ${emp.empname}`,
        employee: emp
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
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
    <div className="relative flex flex-col min-h-screen text-zinc-100">
      <div className="fixed inset-0 z-0 bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto p-6">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">New Custody Record</h3>
            
            {error && (
              <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                      background: 'rgb(51 65 85 / 0.5)',
                      borderColor: 'rgb(71 85 105)',
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'rgb(30 41 59)',
                      border: '1px solid rgb(71 85 105)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'rgb(51 65 85)' : 'transparent',
                      color: 'rgb(226 232 240)',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'rgb(226 232 240)'
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'rgb(226 232 240)'
                    })
                  }}
                  className="text-sm"
                  placeholder="Search by employee number or name..."
                  isClearable
                />
              </div>

              {/* Location Type Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Location Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
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
                  <label className="flex items-center">
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
                </div>
              </div>

              {/* Conditional Fields based on Location Type */}
              {locationType === 'warehouse' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Warehouse Location
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
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
                      <label className="flex items-center">
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
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Room/Rack/Bin Location
                    </label>
                    <input
                      type="text"
                      value={formData.warehouseLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        warehouseLocation: e.target.value
                      }))}
                      className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Location
                    </label>
                    <select
                      value={formData.departmentLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        departmentLocation: e.target.value
                      }))}
                      className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                    >
                      <option value="">Select Location</option>
                      <option value="Dammam">Dammam</option>
                      <option value="Jubail">Jubail</option>
                      <option value="Riyadh">Riyadh</option>
                      <option value="Abha">Abha</option>
                      <option value="Mecca">Mecca</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                          background: 'rgb(51 65 85 / 0.5)',
                          borderColor: 'rgb(71 85 105)',
                        }),
                        menu: (base) => ({
                          ...base,
                          background: 'rgb(30 41 59)',
                          border: '1px solid rgb(71 85 105)'
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? 'rgb(51 65 85)' : 'transparent',
                          color: 'rgb(226 232 240)',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'rgb(226 232 240)'
                        }),
                        input: (base) => ({
                          ...base,
                          color: 'rgb(226 232 240)'
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

              {/* Custody From Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                  className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </div>

              {/* Custody To Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Custody To Date
                </label>
                <DatePicker
                  selected={formData.custodyto}
                  onChange={(date: Date | null) => setFormData(prev => ({
                    ...prev,
                    custodyto: date
                  }))}
                  className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  minDate={formData.custodyfrom || undefined}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-6">
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
} 