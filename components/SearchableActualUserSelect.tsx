'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import { ActualUserOption } from '@/app/api/actual-users/search/route';

interface SearchableActualUserSelectProps {
  value?: string;
  initialName?: string;
  initialType?: 'employee' | 'non_employee' | null;
  onChange: (
    actualUserType: 'employee' | 'non_employee' | null,
    actualUserNo: string,
    actualUserName: string,
    actualUserIdNumber: string
  ) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableActualUserSelect({
  value,
  initialName,
  initialType,
  onChange,
  placeholder = 'Search actual user by name, empno, visitor no, ID/passport...',
  required = false,
  disabled = false,
}: SearchableActualUserSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<ActualUserOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ActualUserOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useAppTheme();

  const isGlassmorphic = theme === 'glassmorphic';
  const isLight = theme === 'light';

  const inputStyles = isGlassmorphic
    ? 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/70 focus:ring-teal-400'
    : isLight
    ? 'bg-white border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-slate-800/90 border border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-teal-400 focus:border-teal-400';

  const dropdownContainerStyles = isGlassmorphic
    ? 'bg-white/10 backdrop-blur-lg border border-white/20'
    : isLight
    ? 'bg-white border border-blue-200 shadow-lg'
    : 'bg-slate-900 border border-slate-700';

  const dropdownTextStyles = isGlassmorphic
    ? 'text-white/80'
    : isLight
    ? 'text-gray-700'
    : 'text-slate-200';

  const dropdownItemTitleStyles = isGlassmorphic
    ? 'font-medium text-white'
    : isLight
    ? 'font-medium text-gray-900'
    : 'font-medium text-slate-100';

  const dropdownItemSubtitleStyles = isGlassmorphic
    ? 'text-sm text-white/70'
    : isLight
    ? 'text-sm text-gray-600'
    : 'text-sm text-slate-300';

  // Fetch actual user options
  const fetchActualUsers = async (search: string) => {
    if (search.length < 2) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/actual-users/search?q=${encodeURIComponent(search)}&limit=15`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data?.records)) {
        setOptions(result.data.records);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching actual users:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync initial selection when props change
  useEffect(() => {
    if (value && initialName) {
      const typeLabel = initialType === 'employee' ? 'Employee' : 'Non-Employee';
      const label = `[${typeLabel}] ${value} - ${initialName}`;
      setSelectedUser({
        type: initialType || 'employee',
        no: value,
        name: initialName,
        idNumber: '',
        userType: typeLabel,
        label,
        value: `${initialType || 'employee'}:${value}`,
      });
      setSearchTerm(label);
    } else if (!value) {
      setSelectedUser(null);
      setSearchTerm('');
    }
  }, [value, initialName, initialType]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        if (!selectedUser || searchTerm !== selectedUser.label) {
          fetchActualUsers(searchTerm);
          setIsOpen(true);
        }
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedUser]);

  const handleSelect = (userOption: ActualUserOption) => {
    setSelectedUser(userOption);
    setSearchTerm(userOption.label);
    setIsOpen(false);
    onChange(userOption.type, userOption.no, userOption.name, userOption.idNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (!newValue) {
      setSelectedUser(null);
      onChange(null, '', '', '');
    } else if (selectedUser && newValue !== selectedUser.label) {
      setSelectedUser(null);
      onChange(null, '', '', '');
    }
  };

  const handleInputFocus = () => {
    if (searchTerm && options.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedUser(null);
    setOptions([]);
    setIsOpen(false);
    onChange(null, '', '', '');
    inputRef.current?.focus();
  };

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
          className={cn('pr-10', inputStyles)}
        />
        {selectedUser && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            ×
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2 rounded-xl shadow-2xl max-h-60 overflow-auto',
            dropdownContainerStyles
          )}
        >
          {loading ? (
            <div className={cn('p-3 text-center', dropdownTextStyles)}>Searching users...</div>
          ) : options.length > 0 ? (
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={`${option.type}:${option.no}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full px-4 py-3 text-left focus:outline-none transition-colors border-b last:border-b-0',
                    isGlassmorphic
                      ? 'hover:bg-white/10 focus:bg-white/10 border-white/5'
                      : isLight
                      ? 'hover:bg-blue-50 focus:bg-blue-50 border-blue-100'
                      : 'hover:bg-slate-800 focus:bg-slate-800 border-slate-700'
                  )}
                >
                  <div className="flex flex-col">
                    <span className={dropdownItemTitleStyles}>{option.label}</span>
                    {option.idNumber && (
                      <span className={dropdownItemSubtitleStyles}>ID/Doc: {option.idNumber}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 && !selectedUser ? (
            <div className={cn('p-3 text-center', dropdownTextStyles)}>No users found</div>
          ) : searchTerm.length < 2 ? (
            <div className={cn('p-3 text-center', dropdownTextStyles)}>
              Type at least 2 characters to search
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
