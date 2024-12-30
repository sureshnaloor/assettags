'use client';
import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { Custody, Employee, Project } from '@/types/custody';
import DatePicker from 'react-datepicker';
import AsyncSelect from 'react-select/async';

interface CustodyDetailsProps {
  currentCustody: Custody | null;
  custodyHistory: Custody[];
  onUpdate: (updatedCustody: Custody | null) => void;
  assetnumber: string;
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
  const [locationType, setLocationType] = useState<'warehouse' | 'department'>('warehouse');
  
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-4 sm:pt-8 px-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">New Custody Record</h3>
        
        {error && (
          <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustodyDetails({ currentCustody, custodyHistory, onUpdate, assetnumber }: CustodyDetailsProps) {
  const [showNewCustodyModal, setShowNewCustodyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple Edit Modal Component
  const EditCustodyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !currentCustody) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">End Current Custody</h3>
          
          {error && (
            <div className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                End Date <span className="text-red-400">*</span>
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                className="w-full bg-slate-700/50 text-zinc-100 text-sm rounded-md border-0 ring-1 ring-slate-600 p-2"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
    <div className="bg-sky-600/80 backdrop-blur-sm rounded-lg shadow-lg p-3 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-emerald-200">Current Custody</h2>
        <div className="flex gap-2">
          {canCreateNewCustody && (
            <button
              onClick={() => setShowNewCustodyModal(true)}
              className="p-1 text-emerald-300 hover:text-emerald-200 transition-colors"
              title="New Custody Record"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          )}
          {currentCustody && !currentCustody.custodyto && (
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1 text-emerald-300 hover:text-emerald-200 transition-colors"
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
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
            <label className="block text-xs font-medium text-teal-100">Employee</label>
            <div className="text-xs text-zinc-100">
              {currentCustody.employeename} ({currentCustody.employeenumber})
            </div>
          </div>

          {/* Location Type */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
            <label className="block text-xs font-medium text-teal-100">Location Type</label>
            <div className="text-xs text-zinc-100">
              {currentCustody.locationType}
            </div>
          </div>

          {/* Conditional fields based on location type */}
          {currentCustody.locationType === 'warehouse' ? (
            <>
              {/* Warehouse City */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
                <label className="block text-xs font-medium text-teal-100">Warehouse City</label>
                <div className="text-xs text-zinc-100">
                  {currentCustody.warehouseCity}
                </div>
              </div>

              {/* Warehouse Location */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
                <label className="block text-xs font-medium text-teal-100">Location</label>
                <div className="text-xs text-zinc-100">
                  {currentCustody.warehouseLocation}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Department Location */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
                <label className="block text-xs font-medium text-teal-100">Department Location</label>
                <div className="text-xs text-zinc-100">
                  {currentCustody.departmentLocation}
                </div>
              </div>

              {/* Project */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
                <label className="block text-xs font-medium text-teal-100">Project</label>
                <div className="text-xs text-zinc-100">
                  {currentCustody.project}
                </div>
              </div>
            </>
          )}

          {/* Custody From Date */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
            <label className="block text-xs font-medium text-teal-100">From Date</label>
            <div className="text-xs text-zinc-100">
              {new Date(currentCustody.custodyfrom).toLocaleDateString()}
            </div>
          </div>

          {/* Custody To Date */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-2">
            <label className="block text-xs font-medium text-teal-100">To Date</label>
            <div className="text-xs text-zinc-100">
              {currentCustody.custodyto ? new Date(currentCustody.custodyto).toLocaleDateString() : 'Current'}
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mt-6 border-t border-sky-500/30 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-emerald-200">Custody History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            {showHistory ? 'Hide History' : `Show History (${custodyHistory?.length || 0} records)`}
          </button>
        </div>

        {showHistory && custodyHistory.length > 0 && (
          <div className="space-y-3">
            {custodyHistory.map((record, index) => (
              <div 
                key={record._id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-md p-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Employee */}
                  <div>
                    <label className="block text-xs font-medium text-teal-100">Employee</label>
                    <div className="text-xs text-zinc-100">
                      {record.employeename} ({record.employeenumber})
                    </div>
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="block text-xs font-medium text-teal-100">Location Type</label>
                    <div className="text-xs text-zinc-100">
                      {record.locationType}
                    </div>
                  </div>

                  {/* Location Details */}
                  {record.locationType === 'warehouse' ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-teal-100">Warehouse City</label>
                        <div className="text-xs text-zinc-100">{record.warehouseCity}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-teal-100">Location</label>
                        <div className="text-xs text-zinc-100">{record.warehouseLocation}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-teal-100">Department Location</label>
                        <div className="text-xs text-zinc-100">{record.departmentLocation}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-teal-100">Project</label>
                        <div className="text-xs text-zinc-100">{record.project}</div>
                      </div>
                    </>
                  )}

                  {/* Dates */}
                  <div>
                    <label className="block text-xs font-medium text-teal-100">From Date</label>
                    <div className="text-xs text-zinc-100">
                      {new Date(record.custodyfrom).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-teal-100">To Date</label>
                    <div className="text-xs text-zinc-100">
                      {record.custodyto ? new Date(record.custodyto).toLocaleDateString() : 'Current'}
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