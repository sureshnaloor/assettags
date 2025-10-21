'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PPEIssueRecord, Employee } from '@/types/ppe';

interface PPEIssuesByEmployeeProps {
  onEmployeeSelect?: (employee: Employee) => void;
  showSearch?: boolean;
  preSelectedEmployee?: Employee | null;
}

interface EmployeeSearchResult {
  records: Employee[];
  total: number;
}

interface PPEIssuesResult {
  records: PPEIssueRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PPEIssuesByEmployee({ 
  onEmployeeSelect, 
  showSearch = true,
  preSelectedEmployee = null
}: PPEIssuesByEmployeeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(preSelectedEmployee);
  const [ppeIssues, setPpeIssues] = useState<PPEIssueRecord[]>([]);
  const [newPpeIssues, setNewPpeIssues] = useState<PPEIssueRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIssuesLoading, setNewIssuesLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle pre-selected employee
  useEffect(() => {
    if (preSelectedEmployee) {
      setSelectedEmployee(preSelectedEmployee);
      fetchPPEIssues(preSelectedEmployee.empno);
      fetchNewPPEIssues(preSelectedEmployee.empno);
    }
  }, [preSelectedEmployee]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search employees
  const searchEmployees = async (term: string) => {
    if (!term || (term.length < 5 && !/^\d+$/.test(term))) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/employees/search?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.records);
        setShowSearchResults(true);
        setError(null);
      } else {
        setError(data.error || 'Failed to search employees');
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (err) {
      setError('Failed to search employees');
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch PPE issues for selected employee
  const fetchPPEIssues = async (empNumber: string) => {
    console.log('Fetching PPE issues for employee:', empNumber);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ppe-issues-by-employee?userEmpNumber=${empNumber}&limit=100`);
      const data = await response.json();
      
      console.log('PPE API response:', data);
      
      if (data.success) {
        // Convert any MongoDB objects to proper JavaScript types
        const processedRecords = data.data.records.map((record: any) => {
          const processedRecord = { ...record };
          
          // Handle MongoDB Decimal objects
          if (typeof processedRecord.quantityIssued === 'object' && processedRecord.quantityIssued.$numberDecimal) {
            processedRecord.quantityIssued = parseFloat(processedRecord.quantityIssued.$numberDecimal);
          }
          
          // Handle MongoDB Date objects
          if (processedRecord.dateOfIssue && typeof processedRecord.dateOfIssue === 'object') {
            processedRecord.dateOfIssue = new Date(processedRecord.dateOfIssue);
          }
          
          // Ensure all string fields are properly converted
          Object.keys(processedRecord).forEach(key => {
            if (typeof processedRecord[key] === 'object' && processedRecord[key] !== null) {
              // Convert any remaining MongoDB objects to strings
              if (processedRecord[key].$numberDecimal) {
                processedRecord[key] = parseFloat(processedRecord[key].$numberDecimal);
              } else if (processedRecord[key].$date) {
                processedRecord[key] = new Date(processedRecord[key].$date);
              } else {
                processedRecord[key] = String(processedRecord[key]);
              }
            }
          });
          
          return processedRecord;
        });
        
        setPpeIssues(processedRecords);
        setError(null);
        console.log('PPE issues loaded:', processedRecords.length, 'records');
      } else {
        console.error('PPE API error:', data.error);
        setError(data.error || 'Failed to fetch PPE issues');
        setPpeIssues([]);
      }
    } catch (err) {
      console.error('PPE fetch error:', err);
      setError('Failed to fetch PPE issues');
      setPpeIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch new PPE issues for selected employee from ppe-records collection
  const fetchNewPPEIssues = async (empNumber: string) => {
    console.log('Fetching new PPE issues for employee:', empNumber);
    setNewIssuesLoading(true);
    try {
      const response = await fetch(`/api/ppe-records?userEmpNumber=${empNumber}&limit=100`);
      const data = await response.json();
      
      console.log('New PPE API response:', data);
      
      if (data.success) {
        // Convert any MongoDB objects to proper JavaScript types
        const processedRecords = data.data.records.map((record: any) => {
          const processedRecord = { ...record };
          
          // Handle MongoDB Decimal objects
          if (typeof processedRecord.quantityIssued === 'object' && processedRecord.quantityIssued.$numberDecimal) {
            processedRecord.quantityIssued = parseFloat(processedRecord.quantityIssued.$numberDecimal);
          }
          
          // Handle MongoDB Date objects
          if (processedRecord.dateOfIssue && typeof processedRecord.dateOfIssue === 'object') {
            processedRecord.dateOfIssue = new Date(processedRecord.dateOfIssue);
          }
          
          // Ensure all string fields are properly converted
          Object.keys(processedRecord).forEach(key => {
            if (typeof processedRecord[key] === 'object' && processedRecord[key] !== null) {
              // Convert any remaining MongoDB objects to strings
              if (processedRecord[key].$numberDecimal) {
                processedRecord[key] = parseFloat(processedRecord[key].$numberDecimal);
              } else if (processedRecord[key].$date) {
                processedRecord[key] = new Date(processedRecord[key].$date);
              } else {
                processedRecord[key] = String(processedRecord[key]);
              }
            }
          });
          
          return processedRecord;
        });
        
        setNewPpeIssues(processedRecords);
        console.log('New PPE issues loaded:', processedRecords.length, 'records');
      } else {
        console.error('New PPE API error:', data.error);
        setNewPpeIssues([]);
      }
    } catch (err) {
      console.error('New PPE fetch error:', err);
      setNewPpeIssues([]);
    } finally {
      setNewIssuesLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search with 500ms delay
    searchTimeoutRef.current = setTimeout(() => {
      searchEmployees(value);
    }, 500);
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.empname} (${employee.empno})`);
    setShowSearchResults(false);
    setSearchResults([]);
    fetchPPEIssues(employee.empno);
    fetchNewPPEIssues(employee.empno);
    
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };

  // Handle direct employee number entry
  const handleDirectSearch = () => {
    if (searchTerm && /^\d+$/.test(searchTerm)) {
      // Direct employee number search
      const mockEmployee: Employee = {
        empno: searchTerm,
        empname: 'Unknown Employee',
        active: 'Y',
        createdAt: new Date(),
        createdBy: 'system'
      };
      handleEmployeeSelect(mockEmployee);
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {showSearch && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-400 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-emerald-800">Search Employee</h3>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter employee number or name (min 5 characters for name)"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
              {/^\d+$/.test(searchTerm) && (
                <Button 
                  onClick={handleDirectSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  Search
                </Button>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="border border-emerald-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-md">
                {searchResults.map((employee) => (
                  <div
                    key={employee.empno}
                    className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100 last:border-b-0 transition-colors duration-200"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="font-medium text-sm text-gray-800">{employee.empname}</div>
                    <div className="text-xs text-gray-600">
                      {employee.empno} • {employee.department || 'No Department'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        </Card>
      )}

      {/* Selected Employee Info */}
      {selectedEmployee && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-l-4 border-slate-400 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Selected Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Name</label>
              <p className="text-sm font-semibold text-slate-800 mt-1">{selectedEmployee.empname}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Employee Number</label>
              <p className="text-sm font-semibold text-slate-800 mt-1">{selectedEmployee.empno}</p>
            </div>
            {selectedEmployee.department && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Department</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedEmployee.department}</p>
              </div>
            )}
            {selectedEmployee.designation && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Designation</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedEmployee.designation}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Past PPE Issues Table */}
      {selectedEmployee && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-amber-800">Past PPE Issues (Historical Data)</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
              <p className="mt-2 text-sm text-amber-600">Loading historical PPE issues...</p>
            </div>
          ) : ppeIssues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-amber-200 rounded-lg overflow-hidden shadow-md">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-100 to-orange-100">
                    <th className="border border-amber-200 px-3 py-2 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">Date of Issue</th>
                    <th className="border border-amber-200 px-3 py-2 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">PPE Name</th>
                    <th className="border border-amber-200 px-3 py-2 text-center text-xs font-semibold text-amber-800 uppercase tracking-wider">Quantity</th>
                    <th className="border border-amber-200 px-3 py-2 text-center text-xs font-semibold text-amber-800 uppercase tracking-wider">Size</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {ppeIssues.map((issue, index) => (
                    <tr key={issue._id || index} className="hover:bg-amber-50 hover:shadow-md transition-all duration-200 border-b border-amber-100">
                      <td className="border border-amber-200 px-3 py-2 text-xs text-gray-700">
                        {formatDate(issue.dateOfIssue)}
                      </td>
                      <td className="border border-amber-200 px-3 py-2 text-xs text-gray-700">
                        {String(issue.ppeName || '')}
                      </td>
                      <td className="border border-amber-200 px-3 py-2 text-center text-xs font-medium text-amber-700">
                        {typeof issue.quantityIssued === 'number' ? issue.quantityIssued : String(issue.quantityIssued || 0)}
                      </td>
                      <td className="border border-amber-200 px-3 py-2 text-center text-xs font-medium text-amber-700">
                        {String(issue.size || '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-amber-600">
              <p className="text-sm">No historical PPE issues found for this employee.</p>
            </div>
          )}
        </Card>
      )}

      {/* New PPE Issues Table */}
      {selectedEmployee && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-400 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">New PPE Issues (Current System)</h3>
          
          {newIssuesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-blue-600">Loading current PPE issues...</p>
            </div>
          ) : newPpeIssues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-200 rounded-lg overflow-hidden shadow-md">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                    <th className="border border-blue-200 px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Date of Issue</th>
                    <th className="border border-blue-200 px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">PPE Name</th>
                    <th className="border border-blue-200 px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Quantity</th>
                    <th className="border border-blue-200 px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Size</th>
                    <th className="border border-blue-200 px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">First Issue</th>
                    <th className="border border-blue-200 px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider">Issue Type</th>
                    <th className="border border-blue-200 px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Issued By</th>
                    <th className="border border-blue-200 px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {newPpeIssues.map((issue, index) => (
                    <tr key={issue._id || index} className="hover:bg-blue-50 hover:shadow-md transition-all duration-200 border-b border-blue-100">
                      <td className="border border-blue-200 px-3 py-2 text-xs text-gray-700">
                        {formatDate(issue.dateOfIssue)}
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-xs text-gray-700">
                        {String(issue.ppeName || '')}
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-center text-xs font-medium text-blue-700">
                        {typeof issue.quantityIssued === 'number' ? issue.quantityIssued : String(issue.quantityIssued || 0)}
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-center text-xs font-medium text-blue-700">
                        {String(issue.size || '-')}
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-center text-xs">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          issue.isFirstIssue 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {String(issue.isFirstIssue ? 'Yes' : 'No')}
                        </span>
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-center text-xs">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          issue.issueAgainstDue 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {String(issue.issueAgainstDue ? 'Due' : 'Damage')}
                        </span>
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-xs text-gray-700">
                        {String(issue.issuedByName || '')}
                      </td>
                      <td className="border border-blue-200 px-3 py-2 text-xs text-gray-700">
                        {String(issue.remarks || '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-blue-600">
              <p className="text-sm">No current PPE issues found for this employee.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
