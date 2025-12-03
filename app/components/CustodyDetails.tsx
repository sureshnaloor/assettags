'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { Custody, Employee, Project } from '@/types/custody';
import DatePicker from 'react-datepicker';
import AsyncSelect from 'react-select/async';
import Link from 'next/link';

import type { Theme } from '@/app/components/AssetDetails';

interface CustodyDetailsProps {
  currentCustody: Custody | null;
  custodyHistory: Custody[];
  onUpdate: (updatedCustody: Custody | null) => void;
  assetnumber: string;
  theme?: Theme;
}

interface CustodyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (custody: Custody) => void;
  assetnumber: string;
}

function CustodyFormModal({ isOpen, onClose, onSave, assetnumber }: CustodyFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [locationType, setLocationType] = useState<'warehouse' | 'department' | 'camp/office'>('warehouse');
  
  const [formData, setFormData] = useState<Partial<Custody>>({
    assetnumber,
    locationType: 'warehouse',
    warehouseCity: 'Dammam',
    custodyfrom: new Date(),
    custodyto: null
  });

  // Fetch employees
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchProjects();      
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
      console.log("employees are", data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
      console.log("projects are", data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    }
  };

  const loadEmployeeOptions = async (inputValue: string) => {
    // Require minimum 3 characters for name searches, or any length for numeric searches
    if (inputValue.length < 3 && !/^\d+$/.test(inputValue)) return [];
    
    try {
      const response = await fetch(`/api/employees/search?q=${encodeURIComponent(inputValue)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch employees');
      }
      
      const data = await response.json();
      // Handle wrapped response format
      const employees = data.success ? data.data?.records || [] : [];
      
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
      
      // Basic validation
      if (!formData.employeenumber || !formData.custodyfrom) {
        setError('Employee and From Date are required');
        return;
      }

      // Add API call to save the custody record
      const response = await fetch(`/api/custody/${assetnumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdat: new Date(),
          createdby: 'current-user' // This should be replaced with actual user info when auth is implemented
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save custody record');
      }

      const savedCustody = await response.json();
      onSave(savedCustody);
      onClose();
    } catch (error) {
      console.error('Error saving custody:', error);
      setError('Failed to save custody record');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl my-10">
          <h3 className="text-lg font-semibold text-zinc-100 mb-6">New Custody Record</h3>
          
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm">
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
                      '&:hover': {
                        borderColor: 'rgb(100 116 139)'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'rgb(30 41 59)',
                      border: '1px solid rgb(71 85 105)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused 
                        ? 'rgb(51 65 85)' 
                        : state.isSelected 
                          ? 'rgb(30 58 138)' 
                          : 'transparent',
                      color: 'rgb(226 232 240)',
                      '&:hover': {
                        backgroundColor: 'rgb(51 65 85)'
                      }
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
                  classNamePrefix="react-select"
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
                  <label className="flex items-center">
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

              {/* Warehouse Fields */}
              {locationType === 'warehouse' && (
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
              )}

              {/* Department Fields */}
              {locationType === 'department' && (
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
                          '&:hover': {
                            borderColor: 'rgb(100 116 139)'
                          }
                        }),
                        menu: (base) => ({
                          ...base,
                          background: 'rgb(30 41 59)',
                          border: '1px solid rgb(71 85 105)'
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused 
                            ? 'rgb(51 65 85)' 
                            : state.isSelected 
                              ? 'rgb(30 58 138)' 
                              : 'transparent',
                          color: 'rgb(226 232 240)',
                          '&:hover': {
                            backgroundColor: 'rgb(51 65 85)'
                          }
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
                      classNamePrefix="react-select"
                      placeholder="Search by WBS or project name..."
                      isClearable
                      isSearchable
                    />
                  </div>
                </>
              )}

              {/* Camp/Office Fields */}
              {locationType === 'camp/office' && (
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
                      Building/Room/Occupant
                    </label>
                    <input
                      type="text"
                      value={formData.campOfficeLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        campOfficeLocation: e.target.value
                      }))}
                      className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                      placeholder="Enter building, room, or occupant details..."
                    />
                  </div>
                </>
              )}

              {/* Add Custody From Date */}
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

              {/* Add Custody To Date */}
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

              {/* Gatepass Document */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Gatepass Document Number
                </label>
                <input
                  type="text"
                  value={formData.documentnumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentnumber: e.target.value
                  }))}
                  className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
                  placeholder="Enter gatepass document number..."
                />
              </div>
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
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustodyDetails({ currentCustody, custodyHistory, onUpdate, assetnumber, theme = 'default' }: CustodyDetailsProps) {
  const [showNewCustodyModal, setShowNewCustodyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme-based style helpers
  const getContainerStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl';
      case 'light':
        return 'bg-white border-2 border-blue-200 rounded-xl shadow-lg';
      default:
        return 'bg-stone-100/90 dark:bg-stone-800/30 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 dark:border-stone-700/50 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]';
    }
  };

  const getFieldStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return {
          container: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl',
          label: 'text-white/80',
          text: 'text-white'
        };
      case 'light':
        return {
          container: 'bg-blue-50 border border-blue-200 rounded-lg',
          label: 'text-blue-900 font-medium',
          text: 'text-gray-900'
        };
      default:
        return {
          container: 'bg-gray-200 dark:bg-slate-700/50 rounded-md',
          label: 'text-gray-600 dark:text-gray-300',
          text: 'text-gray-900 dark:text-white'
        };
    }
  };

  const getTextStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return 'text-white';
      case 'light':
        return 'text-gray-900';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  const getButtonStyles = (color: 'blue') => {
    const baseStyles = 'p-1 transition-colors';
    switch (theme) {
      case 'glassmorphic':
        return `${baseStyles} text-teal-400 hover:text-teal-300`;
      case 'light':
        return `${baseStyles} text-blue-600 hover:text-blue-700`;
      default:
        return `${baseStyles} text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300`;
    }
  };

  const fieldStyles = getFieldStyles();

  // Simple Edit Modal Component
  const EditCustodyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !currentCustody) return null;

    const getModalStyles = () => {
      switch (theme) {
        case 'glassmorphic':
          return {
            container: 'bg-white/10 backdrop-blur-lg border border-white/20',
            text: 'text-white',
            textSecondary: 'text-white/80',
            input: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
            buttonPrimary: 'bg-teal-500 hover:bg-teal-600',
            buttonSecondary: 'bg-white/10 hover:bg-white/20 border border-white/20'
          };
        case 'light':
          return {
            container: 'bg-white border-2 border-blue-200',
            text: 'text-gray-900',
            textSecondary: 'text-gray-700',
            input: 'bg-white border-2 border-blue-300 text-gray-900',
            buttonPrimary: 'bg-blue-500 hover:bg-blue-600',
            buttonSecondary: 'bg-gray-200 hover:bg-gray-300'
          };
        default:
          return {
            container: 'bg-slate-800',
            text: 'text-zinc-100',
            textSecondary: 'text-zinc-300',
            input: 'bg-slate-700/50 text-zinc-100 border-0 ring-1 ring-slate-600',
            buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
            buttonSecondary: 'bg-slate-600 hover:bg-slate-700'
          };
      }
    };

    const modalStyles = getModalStyles();

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
        <div className={`${modalStyles.container} rounded-lg shadow-xl p-6 max-w-md w-full mx-4`}>
          <h3 className={`text-lg font-semibold ${modalStyles.text} mb-4`}>End Current Custody</h3>
          
          {error && (
            <div className={`${theme === 'glassmorphic' ? 'bg-red-500/20 text-red-300' : theme === 'light' ? 'bg-red-50 text-red-700' : 'bg-red-500/20 text-red-100'} px-4 py-2 rounded-lg text-sm mb-4`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${modalStyles.textSecondary} mb-1`}>
                End Date <span className={theme === 'glassmorphic' ? 'text-red-400' : theme === 'light' ? 'text-red-600' : 'text-red-400'}>*</span>
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                className={`w-full text-sm rounded-xl p-2 ${modalStyles.input}`}
                dateFormat="yyyy-MM-dd"
                minDate={new Date(currentCustody.custodyfrom)}
                maxDate={new Date()}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={async () => {
                try {
                  if (!endDate) {
                    setError('End date is required');
                    return;
                  }
                  setIsSaving(true);
                  
                  const response = await fetch(`/api/custody/${assetnumber}/${currentCustody._id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      ...currentCustody,
                      custodyto: endDate
                    }),
                  });

                  if (!response.ok) throw new Error('Failed to update custody record');
                  
                  const updatedCustody = await response.json();
                  onUpdate(updatedCustody);
                  onClose();
                } catch (error) {
                  console.error('Error updating custody:', error);
                  setError('Failed to update custody record');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className={`flex-1 ${modalStyles.buttonPrimary} disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className={`flex-1 ${modalStyles.buttonSecondary} disabled:opacity-50 ${theme === 'glassmorphic' ? 'text-white' : theme === 'light' ? 'text-gray-900' : 'text-white'} px-4 py-2 rounded-xl text-sm font-medium transition-colors`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check if new custody can be created
  const canCreateNewCustody = !currentCustody || currentCustody.custodyto !== null;

  return (
    <div className={`${getContainerStyles()} p-3 w-full max-w-4xl relative`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-sm font-semibold ${getTextStyles()}`}>Current Custody</h2>
        <div className="flex gap-2">
          {canCreateNewCustody && (
            <Link
              href={`/fixedasset/${assetnumber}/custody/new`}
              className={getButtonStyles('blue')}
              title="New Custody Record"
            >
              <PlusIcon className="h-5 w-5" />
            </Link>
          )}
          {currentCustody && !currentCustody.custodyto && (
            <button
              onClick={() => setShowEditModal(true)}
              className={getButtonStyles('blue')}
              title="End Current Custody"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Display Current Custody */}
      {currentCustody && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Employee */}
          <div className={`${fieldStyles.container} p-2`}>
            <label className={`block text-xs font-medium ${fieldStyles.label}`}>Employee</label>
            <div className={`text-sm ${fieldStyles.text}`}>
              {currentCustody.employeename} ({currentCustody.employeenumber})
            </div>
          </div>

          {/* Location Type */}
          <div className={`${fieldStyles.container} p-2`}>
            <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location Type</label>
            <div className={`text-sm ${fieldStyles.text} capitalize`}>
              {currentCustody.locationType}
            </div>
          </div>

          {/* Conditional fields based on location type */}
          {currentCustody.locationType === 'warehouse' && (
            <>
              {/* Warehouse City */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Warehouse City</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.warehouseCity}
                </div>
              </div>

              {/* Warehouse Location */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.warehouseLocation}
                </div>
              </div>
            </>
          )}

          {currentCustody.locationType === 'department' && (
            <>
              {/* Department Location */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Department Location</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.departmentLocation}
                </div>
              </div>

              {/* Project */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Project</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.project}
                </div>
              </div>
            </>
          )}

          {currentCustody.locationType === 'camp/office' && (
            <>
              {/* Camp/Office Location */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.departmentLocation}
                </div>
              </div>

              {/* Building/Room/Occupant */}
              <div className={`${fieldStyles.container} p-2`}>
                <label className={`block text-xs font-medium ${fieldStyles.label}`}>Building/Room/Occupant</label>
                <div className={`text-sm ${fieldStyles.text}`}>
                  {currentCustody.campOfficeLocation}
                </div>
              </div>
            </>
          )}

          {/* Custody From Date */}
          <div className={`${fieldStyles.container} p-2`}>
            <label className={`block text-xs font-medium ${fieldStyles.label}`}>From Date</label>
            <div className={`text-sm ${fieldStyles.text}`}>
              {new Date(currentCustody.custodyfrom).toLocaleDateString()}
            </div>
          </div>

          {/* Custody To Date */}
          <div className={`${fieldStyles.container} p-2`}>
            <label className={`block text-xs font-medium ${fieldStyles.label}`}>To Date</label>
            <div className={`text-sm ${fieldStyles.text}`}>
              {currentCustody.custodyto ? new Date(currentCustody.custodyto).toLocaleDateString() : 'Current'}
            </div>
          </div>

          {/* Gatepass Document */}
          <div className={`${fieldStyles.container} p-2`}>
            <label className={`block text-xs font-medium ${fieldStyles.label}`}>Gatepass Document</label>
            <div className={`text-sm ${fieldStyles.text}`}>
              {currentCustody.documentnumber || 'Not specified'}
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className={`mt-6 border-t ${theme === 'glassmorphic' ? 'border-white/20' : theme === 'light' ? 'border-blue-200' : 'border-gray-200 dark:border-slate-600/80'} pt-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${getTextStyles()}`}>Custody History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs transition-colors ${
              theme === 'glassmorphic'
                ? 'text-teal-400 hover:text-teal-300'
                : theme === 'light'
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
          >
            {showHistory ? 'Hide History' : `Show History (${custodyHistory?.length || 0} records)`}
          </button>
        </div>

        {showHistory && custodyHistory.length > 0 && (
          <div className="space-y-3">
            {custodyHistory.map((record) => (
              <div 
                key={record._id}
                className={`${fieldStyles.container} p-3`}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Employee */}
                  <div>
                    <label className={`block text-xs font-medium ${fieldStyles.label}`}>Employee</label>
                    <div className={`text-sm ${fieldStyles.text}`}>
                      {record.employeename} ({record.employeenumber})
                    </div>
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location Type</label>
                    <div className={`text-sm ${fieldStyles.text} capitalize`}>
                      {record.locationType}
                    </div>
                  </div>

                  {/* Location Details */}
                  {record.locationType === 'warehouse' && (
                    <>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Warehouse City</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.warehouseCity}</div>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.warehouseLocation}</div>
                      </div>
                    </>
                  )}

                  {record.locationType === 'department' && (
                    <>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Department Location</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.departmentLocation}</div>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Project</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.project}</div>
                      </div>
                    </>
                  )}

                  {record.locationType === 'camp/office' && (
                    <>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Location</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.departmentLocation}</div>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${fieldStyles.label}`}>Building/Room/Occupant</label>
                        <div className={`text-sm ${fieldStyles.text}`}>{record.campOfficeLocation}</div>
                      </div>
                    </>
                  )}

                  {/* Dates */}
                  <div>
                    <label className={`block text-xs font-medium ${fieldStyles.label}`}>From Date</label>
                    <div className={`text-sm ${fieldStyles.text}`}>
                      {new Date(record.custodyfrom).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${fieldStyles.label}`}>To Date</label>
                    <div className={`text-sm ${fieldStyles.text}`}>
                      {record.custodyto ? new Date(record.custodyto).toLocaleDateString() : 'Current'}
                    </div>
                  </div>

                  {/* Gatepass Document */}
                  <div>
                    <label className={`block text-xs font-medium ${fieldStyles.label}`}>Gatepass Document</label>
                    <div className={`text-sm ${fieldStyles.text}`}>
                      {record.documentnumber || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditCustodyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {/* New Custody Modal */}
      <CustodyFormModal
        isOpen={showNewCustodyModal}
        onClose={() => setShowNewCustodyModal(false)}
        onSave={onUpdate}
        assetnumber={assetnumber}
      />
    </div>
  );
} 