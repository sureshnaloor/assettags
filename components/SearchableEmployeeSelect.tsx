'use client';

import { useState, useEffect, useRef } from 'react';
import { Employee } from '@/types/ppe';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchableEmployeeSelectProps {
  value: string;
  onChange: (empNumber: string, empName: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableEmployeeSelect({
  value,
  onChange,
  placeholder = "Search employee by name or number...",
  required = false,
  disabled = false
}: SearchableEmployeeSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch employees based on search term
  const fetchEmployees = async (search: string) => {
    if (search.length < 2) {
      setEmployees([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/employees?search=${encodeURIComponent(search)}&limit=10`);
      const result = await response.json();
      
      if (result.success) {
        setEmployees(result.data.records.filter((emp: Employee) => emp.active !== 'N'));
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        // Only search if we don't have a selected employee or if the search term is different from the selected employee's display text
        const selectedDisplayText = selectedEmployee ? `${selectedEmployee.empno} - ${selectedEmployee.empname}` : '';
        if (!selectedEmployee || searchTerm !== selectedDisplayText) {
          fetchEmployees(searchTerm);
          setIsOpen(true);
        }
      } else {
        setEmployees([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedEmployee]);

  // Handle employee selection
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.empno} - ${employee.empname}`);
    setIsOpen(false);
    onChange(employee.empno, employee.empname);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // If user clears the input, clear selection
    if (!newValue) {
      setSelectedEmployee(null);
      onChange('', '');
    } else {
      // If user starts typing and it's different from the selected employee's display text, clear selection
      const selectedDisplayText = selectedEmployee ? `${selectedEmployee.empno} - ${selectedEmployee.empname}` : '';
      if (selectedEmployee && newValue !== selectedDisplayText) {
        setSelectedEmployee(null);
        onChange('', '');
      }
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm && employees.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  // Clear selection
  const handleClear = () => {
    setSearchTerm('');
    setSelectedEmployee(null);
    setEmployees([]);
    setIsOpen(false);
    onChange('', '');
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-20"
        />
        {selectedEmployee && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            ×
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              Searching...
            </div>
          ) : employees.length > 0 ? (
            <div className="py-1">
              {employees.map((employee) => (
                <button
                  key={employee.empno}
                  type="button"
                  onClick={() => handleEmployeeSelect(employee)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {employee.empno} - {employee.empname}
                    </span>
                    {employee.department && (
                      <span className="text-sm text-gray-500">
                        {employee.department}
                        {employee.designation && ` • ${employee.designation}`}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 && !selectedEmployee ? (
            <div className="p-3 text-center text-gray-500">
              No employees found
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="p-3 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
