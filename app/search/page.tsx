'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
    }>>([]);
    const animationFrameRef = useRef<number>();

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

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
            {/* Animated background canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            
            {/* Main content */}
            <div className="relative z-20 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen">
                {/* Header Section */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent mb-2">
                        Asset Search & Filter
                    </h1>
                    <p className="text-white/80 text-lg">Search and filter assets by various criteria</p>
                </div>
            
                {/* Compact Search Section */}
                <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
                <div className="space-y-4">
                    {/* Value Range Slider */}
                    <div>
                        <label className="block text-sm font-medium mb-3 text-white">
                            Acquisition Value Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()} SAR
                        </label>
                        <div className="relative h-8 slider-container">
                            {/* Background track */}
                            <div className="absolute top-4 left-0 right-0 h-2 bg-white/20 rounded-lg"></div>
                            
                            {/* Active range track */}
                            <div 
                                className="absolute top-4 h-2 bg-teal-500 rounded-lg"
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
                                className="absolute top-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-teal-600 transition-colors z-10"
                                style={{ left: `calc(${(minValue / 1000000) * 100}% - 8px)` }}
                                onMouseDown={() => setIsDragging('min')}
                            ></div>
                            
                            {/* Max value thumb */}
                            <div 
                                className="absolute top-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-teal-600 transition-colors z-10"
                                style={{ left: `calc(${(maxValue / 1000000) * 100}% - 8px)` }}
                                onMouseDown={() => setIsDragging('max')}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-white/70 mt-1">
                            <span>0 SAR</span>
                            <span>1,000,000 SAR</span>
                        </div>
                    </div>

                    {/* Date Range and Search Type */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 max-w-[200px]">
                            <label className="block text-sm font-medium mb-2 text-white">
                                From Date
                            </label>
                            <Input
                                type="date"
                                value={minDate}
                                onChange={(e) => setMinDate(e.target.value)}
                                className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <label className="block text-sm font-medium mb-2 text-white">
                                To Date
                            </label>
                            <Input
                                type="date"
                                value={maxDate}
                                onChange={(e) => setMaxDate(e.target.value)}
                                className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex-1 max-w-[500px]">
                            <label className="block text-sm font-medium mb-2 text-white">
                                Search Type
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsComboBoxOpen(!isComboBoxOpen)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {(() => {
                                            const selectedOption = getSelectedOption();
                                            const IconComponent = selectedOption?.icon;
                                            return (
                                                <>
                                                    {IconComponent && <IconComponent className="h-4 w-4 text-teal-400 flex-shrink-0" />}
                                                    <span className="text-sm truncate">{selectedOption?.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-white/70 transition-transform duration-200 flex-shrink-0 ${isComboBoxOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isComboBoxOpen && (
                                    <div className="absolute z-[9999] w-full mt-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
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
                                                    className={`w-full flex items-center gap-2 p-3 text-left hover:bg-white/20 transition-colors ${
                                                        searchType === option.value ? 'bg-white/20' : ''
                                                    }`}
                                                >
                                                    <IconComponent className="h-4 w-4 text-teal-400 flex-shrink-0" />
                                                    <span className="text-sm text-white truncate">{option.label}</span>
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
                                        ? 'border-teal-500 bg-teal-500/20 text-white'
                                        : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <Wrench className="h-5 w-5" />
                                <span className="text-sm font-medium">MME</span>
                            </button>
                            <button
                                onClick={() => setAssetType('fixed_assets')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                                    assetType === 'fixed_assets'
                                        ? 'border-teal-500 bg-teal-500/20 text-white'
                                        : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <Building className="h-5 w-5" />
                                <span className="text-sm font-medium">Fixed Assets</span>
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={searchAssets} 
                            className="flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white" 
                            disabled={loading}
                        >
                            <Search className="h-4 w-4" />
                            {loading ? 'Searching...' : 'Search Assets'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={clearFilters} 
                            className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section with Gradient Background */}
            {hasSearched && (
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-xl">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {getSelectedOption() && (
                                    <>
                                        {(() => {
                                            const IconComponent = getSelectedOption()!.icon;
                                            return <IconComponent className="h-5 w-5 text-teal-400" />;
                                        })()}
                                        <span className="font-medium text-white">
                                            {getSelectedOption()!.label}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-white/80">
                                Total Results: <span className="font-semibold text-white">{results.length}</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-300 text-center p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                                Error: {error}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8 text-white/80">
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
                                            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                                        >
                                            {asset.assetnumber}
                                        </Link>
                                    ),
                                    assetstatus: (
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            asset.assetstatus === 'Active' 
                                                ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                                : asset.assetstatus === 'Inactive'
                                                ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                                : 'bg-white/10 text-white/70 border border-white/20'
                                        }`}>
                                            {asset.assetstatus}
                                        </span>
                                    ),
                                    assetcategory: (
                                        <div className="text-sm">
                                            <div className="font-medium text-white">{asset.assetcategory}</div>
                                            {asset.assetsubcategory && (
                                                <div className="text-white/70">{asset.assetsubcategory}</div>
                                            )}
                                        </div>
                                    ),
                                    assetmodel: asset.assetmodel || 'N/A',
                                    assetmanufacturer: asset.assetmanufacturer || 'N/A',
                                    assetserialnumber: asset.assetserialnumber || 'N/A',
                                    location: (
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            asset.location === 'Dammam Warehouse' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                                            asset.location === 'Jubail Warehouse' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                                            asset.location === 'With Users' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                                            asset.location === 'Not Traced' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                                            'bg-white/10 text-white/70 border border-white/20'
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
                                variant="glassmorphic"
                            />
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
