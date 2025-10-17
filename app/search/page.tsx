'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, X, MapPin, User, AlertTriangle, Wrench, Building, ChevronDown } from 'lucide-react';
import Loading from '@/app/components/Loading';
import ResponsiveTable from '@/components/ui/responsive-table';
import Link from 'next/link';

interface SearchResult {
    assetnumber: string;
    assetdescription: string;
    assetstatus: string;
    assetmodel: string;
    assetmanufacturer: string;
    assetserialnumber: string;
    acquireddate: string;
    acquiredvalue: number;
    assetcategory: string;
    assetsubcategory: string;
    assetnotes: string;
    accessories: string;
    location: string;
    custodyDetails?: any;
}

type SortField = 'assetnumber' | 'assetdescription' | 'acquireddate' | 'acquiredvalue';
type SortOrder = 'asc' | 'desc';
type SearchType = 'dammam' | 'jubail' | 'with_users' | 'not_traced' | 'mme' | 'fixed_assets';
type AssetType = 'mme' | 'fixed_assets';

const searchOptions = [
    { value: 'dammam', label: 'Lying in Dammam Warehouse', icon: MapPin, color: 'text-blue-600' },
    { value: 'jubail', label: 'Lying in Jubail Warehouse', icon: MapPin, color: 'text-green-600' },
    { value: 'with_users', label: 'Equipment with Users\' Custody', icon: User, color: 'text-purple-600' },
    { value: 'not_traced', label: 'Equipment Not Yet Traced (No Custody)', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'mme', label: 'MME (Measuring & Monitoring Equipment)', icon: Wrench, color: 'text-orange-600' },
    { value: 'fixed_assets', label: 'Fixed Assets', icon: Building, color: 'text-indigo-600' },
];

export default function AssetSearchPage() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('assetnumber');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    
    // Filter states
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(1000000);
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('mme');
    const [assetType, setAssetType] = useState<AssetType>('mme');
    const [hasSearched, setHasSearched] = useState(false);
    const [isComboBoxOpen, setIsComboBoxOpen] = useState(false);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

    const searchAssets = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams({
                sortField,
                sortOrder,
                searchType,
                assetType,
            });

            if (minValue > 0) params.append('minValue', minValue.toString());
            if (maxValue < 1000000) params.append('maxValue', maxValue.toString());
            if (minDate) params.append('minDate', minDate);
            if (maxDate) params.append('maxDate', maxDate);

            const response = await fetch(`/api/search/assets?${params}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to search assets');
            }
            
            const result = await response.json();
            setResults(result.data);
            setHasSearched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search assets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setMinValue(0);
        setMaxValue(1000000);
        setMinDate('');
        setMaxDate('');
        setSearchType('mme');
        setAssetType('mme');
        setResults([]);
        setHasSearched(false);
        setError(null);
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (value: number) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(value);
    };

    const getSelectedOption = () => {
        return searchOptions.find(option => option.value === searchType);
    };

    // Mouse event handlers for slider dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
        if (!sliderContainer) return;
        
        const rect = sliderContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newValue = Math.round(percentage * 1000000 / 10000) * 10000;
        
        if (isDragging === 'min' && newValue <= maxValue) {
            setMinValue(newValue);
        } else if (isDragging === 'max' && newValue >= minValue) {
            setMaxValue(newValue);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    // Add event listeners for mouse events
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minValue, maxValue]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-4">
                <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">Asset Search & Filter</h1>
            </div>
            
            {/* Compact Search Section */}
            <div className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="space-y-4">
                    {/* Value Range Slider */}
                    <div>
                        <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                            Acquisition Value Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()} SAR
                        </label>
                        <div className="relative h-8 slider-container">
                            {/* Background track */}
                            <div className="absolute top-4 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                            
                            {/* Active range track */}
                            <div 
                                className="absolute top-4 h-2 bg-blue-500 rounded-lg"
                                style={{
                                    left: `${(minValue / 1000000) * 100}%`,
                                    width: `${((maxValue - minValue) / 1000000) * 100}%`
                                }}
                            ></div>
                            
                            {/* Track click handler */}
                            <div 
                                className="absolute top-0 left-0 right-0 h-8 cursor-pointer"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const clickX = e.clientX - rect.left;
                                    const percentage = clickX / rect.width;
                                    const newValue = Math.round(percentage * 1000000 / 10000) * 10000;
                                    
                                    // Determine which thumb to move based on which is closer
                                    const minDistance = Math.abs(newValue - minValue);
                                    const maxDistance = Math.abs(newValue - maxValue);
                                    
                                    if (minDistance < maxDistance) {
                                        if (newValue <= maxValue) {
                                            setMinValue(newValue);
                                        }
                                    } else {
                                        if (newValue >= minValue) {
                                            setMaxValue(newValue);
                                        }
                                    }
                                }}
                            ></div>
                            
                            {/* Min value thumb */}
                            <div 
                                className="absolute top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-10"
                                style={{ left: `calc(${(minValue / 1000000) * 100}% - 8px)` }}
                                onMouseDown={() => setIsDragging('min')}
                            ></div>
                            
                            {/* Max value thumb */}
                            <div 
                                className="absolute top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-10"
                                style={{ left: `calc(${(maxValue / 1000000) * 100}% - 8px)` }}
                                onMouseDown={() => setIsDragging('max')}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>0 SAR</span>
                            <span>1,000,000 SAR</span>
                        </div>
                    </div>

                    {/* Date Range and Search Type */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 max-w-[200px]">
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                From Date
                            </label>
                            <Input
                                type="date"
                                value={minDate}
                                onChange={(e) => setMinDate(e.target.value)}
                                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                To Date
                            </label>
                            <Input
                                type="date"
                                value={maxDate}
                                onChange={(e) => setMaxDate(e.target.value)}
                                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div className="flex-1 max-w-[500px]">
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                Search Type
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsComboBoxOpen(!isComboBoxOpen)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 hover:border-slate-300 dark:hover:border-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {(() => {
                                            const selectedOption = getSelectedOption();
                                            const IconComponent = selectedOption?.icon;
                                            return (
                                                <>
                                                    {IconComponent && <IconComponent className={`h-4 w-4 ${selectedOption?.color} flex-shrink-0`} />}
                                                    <span className="text-slate-900 dark:text-slate-100 text-sm truncate">{selectedOption?.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isComboBoxOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isComboBoxOpen && (
                                    <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {searchOptions.map((option) => {
                                            const IconComponent = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSearchType(option.value as SearchType);
                                                        if (option.value === 'fixed_assets') {
                                                            setAssetType('fixed_assets');
                                                        } else if (option.value === 'mme') {
                                                            setAssetType('mme');
                                                        }
                                                        setIsComboBoxOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors ${
                                                        searchType === option.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}
                                                >
                                                    <IconComponent className={`h-4 w-4 ${option.color} flex-shrink-0`} />
                                                    <span className="text-sm text-slate-900 dark:text-slate-100 truncate">{option.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Asset Type Selection (only show for MME/Fixed Assets) */}
                    {(searchType === 'mme' || searchType === 'fixed_assets') && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAssetType('mme')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                                    assetType === 'mme'
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-400'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white/90 dark:bg-slate-700/90'
                                }`}
                            >
                                <Wrench className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">MME</span>
                            </button>
                            <button
                                onClick={() => setAssetType('fixed_assets')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                                    assetType === 'fixed_assets'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white/90 dark:bg-slate-700/90'
                                }`}
                            >
                                <Building className="h-5 w-5 text-indigo-600" />
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Fixed Assets</span>
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Button onClick={searchAssets} className="flex items-center gap-2 rounded-xl" disabled={loading}>
                            <Search className="h-4 w-4" />
                            {loading ? 'Searching...' : 'Search Assets'}
                        </Button>
                        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 rounded-xl">
                            <X className="h-4 w-4" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section with Gradient Background */}
            {hasSearched && (
                <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {getSelectedOption() && (
                                    <>
                                        {(() => {
                                            const IconComponent = getSelectedOption()!.icon;
                                            return <IconComponent className={`h-5 w-5 ${getSelectedOption()!.color}`} />;
                                        })()}
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                            {getSelectedOption()!.label}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Total Results: <span className="font-semibold">{results.length}</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <Loading message="Searching assets..." />
                            </div>
                        ) : error ? (
                            <div className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                Error: {error}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                No assets found matching your criteria
                            </div>
                        ) : (
                            <ResponsiveTable
                                columns={[
                                    { key: 'assetnumber', label: 'Asset Number', sortable: true },
                                    { key: 'assetdescription', label: 'Description', sortable: true },
                                    { key: 'assetstatus', label: 'Status' },
                                    { key: 'assetcategory', label: 'Category' },
                                    { key: 'assetmodel', label: 'Model' },
                                    { key: 'assetmanufacturer', label: 'Manufacturer' },
                                    { key: 'assetserialnumber', label: 'Serial Number' },
                                    { key: 'location', label: 'Location' },
                                    { key: 'acquireddate', label: 'Acquired Date', sortable: true },
                                    { key: 'acquiredvalue', label: 'Acquired Value', sortable: true },
                                ]}
                                data={results.map(asset => ({
                                    ...asset,
                                    assetnumber: (
                                        <Link 
                                            href={`/asset/${asset.assetnumber}`}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                        >
                                            {asset.assetnumber}
                                        </Link>
                                    ),
                                    assetstatus: (
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            asset.assetstatus === 'Active' 
                                                ? 'bg-green-100 text-green-800'
                                                : asset.assetstatus === 'Inactive'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {asset.assetstatus}
                                        </span>
                                    ),
                                    assetcategory: (
                                        <div className="text-sm">
                                            <div className="font-medium">{asset.assetcategory}</div>
                                            {asset.assetsubcategory && (
                                                <div className="text-gray-500">{asset.assetsubcategory}</div>
                                            )}
                                        </div>
                                    ),
                                    assetmodel: asset.assetmodel || 'N/A',
                                    assetmanufacturer: asset.assetmanufacturer || 'N/A',
                                    assetserialnumber: asset.assetserialnumber || 'N/A',
                                    location: (
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            asset.location === 'Dammam Warehouse' ? 'bg-blue-100 text-blue-800' :
                                            asset.location === 'Jubail Warehouse' ? 'bg-green-100 text-green-800' :
                                            asset.location === 'With Users' ? 'bg-purple-100 text-purple-800' :
                                            asset.location === 'Not Traced' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {asset.location}
                                        </span>
                                    ),
                                    acquireddate: formatDate(asset.acquireddate),
                                    acquiredvalue: formatCurrency(asset.acquiredvalue),
                                }))}
                                sortField={sortField}
                                sortOrder={sortOrder}
                                onSort={toggleSort}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
