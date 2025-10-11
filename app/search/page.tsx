'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, X, MapPin, User, AlertTriangle, Wrench, Building } from 'lucide-react';

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
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('mme');
    const [assetType, setAssetType] = useState<AssetType>('mme');
    const [hasSearched, setHasSearched] = useState(false);

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

            if (minValue) params.append('minValue', minValue);
            if (maxValue) params.append('maxValue', maxValue);
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
        setMinValue('');
        setMaxValue('');
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

    return (
        <div className="container mx-auto py-6 space-y-6 min-h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Asset Search & Filter</CardTitle>
                    <p className="text-sm text-gray-600">
                        Search and filter assets by location, custody status, and acquisition details
                    </p>
                </CardHeader>
                <CardContent>
                    {/* Filters Section */}
                    <div className="space-y-6">
                        {/* Value and Date Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Acquisition Value (SAR)
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min Value"
                                        value={minValue}
                                        onChange={(e) => setMinValue(e.target.value)}
                                        className="text-sm"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max Value"
                                        value={maxValue}
                                        onChange={(e) => setMaxValue(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Acquisition Date
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={minDate}
                                        onChange={(e) => setMinDate(e.target.value)}
                                        className="text-sm"
                                    />
                                    <Input
                                        type="date"
                                        value={maxDate}
                                        onChange={(e) => setMaxDate(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Type Selection */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-medium mb-3">
                                Search Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {searchOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSearchType(option.value as SearchType);
                                                // Auto-set asset type based on selection
                                                if (option.value === 'fixed_assets') {
                                                    setAssetType('fixed_assets');
                                                } else if (option.value === 'mme') {
                                                    setAssetType('mme');
                                                }
                                            }}
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                                                searchType === option.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <IconComponent className={`h-5 w-5 ${option.color}`} />
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Asset Type Selection (only show for MME/Fixed Assets) */}
                        {(searchType === 'mme' || searchType === 'fixed_assets') && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium mb-3">
                                    Asset Type
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setAssetType('mme')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                            assetType === 'mme'
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Wrench className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium">MME</span>
                                    </button>
                                    <button
                                        onClick={() => setAssetType('fixed_assets')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                            assetType === 'fixed_assets'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Building className="h-5 w-5 text-indigo-600" />
                                        <span className="text-sm font-medium">Fixed Assets</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <Button onClick={searchAssets} className="flex items-center gap-2" disabled={loading}>
                                <Search className="h-4 w-4" />
                                {loading ? 'Searching...' : 'Search Assets'}
                            </Button>
                            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Results Section */}
                    {hasSearched && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {getSelectedOption() && (
                                        <>
                                            {(() => {
                                                const IconComponent = getSelectedOption()!.icon;
                                                return <IconComponent className={`h-5 w-5 ${getSelectedOption()!.color}`} />;
                                            })()}
                                            <span className="font-medium">
                                                {getSelectedOption()!.label}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Results: <span className="font-semibold">{results.length}</span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-32">Loading...</div>
                            ) : error ? (
                                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                                    Error: {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleSort('assetnumber')}
                                                        className="flex items-center gap-2 p-0 h-auto font-semibold"
                                                    >
                                                        Asset Number
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleSort('assetdescription')}
                                                        className="flex items-center gap-2 p-0 h-auto font-semibold"
                                                    >
                                                        Description
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Manufacturer</TableHead>
                                                <TableHead>Serial Number</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleSort('acquireddate')}
                                                        className="flex items-center gap-2 p-0 h-auto font-semibold"
                                                    >
                                                        Acquired Date
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleSort('acquiredvalue')}
                                                        className="flex items-center gap-2 p-0 h-auto font-semibold"
                                                    >
                                                        Acquired Value
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                        No assets found matching your criteria
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                results.map((asset, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            {asset.assetnumber}
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">
                                                            {asset.assetdescription}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                asset.assetstatus === 'Active' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : asset.assetstatus === 'Inactive'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {asset.assetstatus}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div className="font-medium">{asset.assetcategory}</div>
                                                                {asset.assetsubcategory && (
                                                                    <div className="text-gray-500">{asset.assetsubcategory}</div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{asset.assetmodel || 'N/A'}</TableCell>
                                                        <TableCell>{asset.assetmanufacturer || 'N/A'}</TableCell>
                                                        <TableCell>{asset.assetserialnumber || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                asset.location === 'Dammam Warehouse' ? 'bg-blue-100 text-blue-800' :
                                                                asset.location === 'Jubail Warehouse' ? 'bg-green-100 text-green-800' :
                                                                asset.location === 'With Users' ? 'bg-purple-100 text-purple-800' :
                                                                asset.location === 'Not Traced' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {asset.location}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{formatDate(asset.acquireddate)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(asset.acquiredvalue)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
