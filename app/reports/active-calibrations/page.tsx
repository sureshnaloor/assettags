'use client';

import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import ResponsiveTable from '@/components/ui/responsive-table';
import Link from 'next/link';

interface ActiveCalibration {
    assetnumber: string;
    assetdescription: string;
    calibrationdate: string;
    calibrationtodate: string;
    calibratedby: string;
    calibcertificate: string;
    assetmodel: string;
    assetmanufacturer: string;
    assetstatus: string;
}

type SortField = 'assetnumber' | 'assetdescription' | 'calibrationtodate';
type SortOrder = 'asc' | 'desc';

export default function ActiveCalibrationsReport() {
    const [calibrations, setCalibrations] = useState<ActiveCalibration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('calibrationtodate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
    }>>([]);
    const animationFrameRef = useRef<number>();

    // Network canvas animation
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

        // Initialize particles
        particlesRef.current = [];
        for (let i = 0; i < 40; i++) {
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            if (!ctx || !canvas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
                ctx.fill();

                // Draw connections
                particlesRef.current.forEach((otherParticle, j) => {
                    if (i !== j) {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 120) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = `rgba(45, 212, 191, ${0.2 * (1 - distance / 120)})`;
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

    const fetchActiveCalibrations = async () => {
        try {
            const response = await fetch(`/api/reports/active-calibrations?sortField=${sortField}&sortOrder=${sortOrder}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const result = await response.json();
            setCalibrations(result.data);
        } catch (err) {
            setError('Failed to load active calibrations data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveCalibrations();
    }, [sortField, sortOrder]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    if (loading) return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            <div className="relative z-20 flex justify-center items-center min-h-screen">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400 mx-auto"></div>
                    <p className="text-white mt-4 text-center">Loading calibrations...</p>
                </div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            <div className="relative z-20 flex justify-center items-center min-h-screen px-4">
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 rounded-2xl p-8 max-w-md">
                    <p className="text-red-300 text-center font-medium">Error: {error}</p>
                </div>
            </div>
        </div>
    );

    const columns = [
        { key: 'assetnumber', label: 'Asset Number', sortable: true },
        { key: 'assetdescription', label: 'Description', sortable: true },
        { key: 'assetmodel', label: 'Model' },
        { key: 'assetmanufacturer', label: 'Manufacturer' },
        { key: 'assetstatus', label: 'Status' },
        { key: 'calibrationdate', label: 'Calibration Date' },
        { key: 'calibrationtodate', label: 'Valid Until', sortable: true },
        { key: 'calibratedby', label: 'Calibrated By' },
        { key: 'calibcertificate', label: 'Certificate No.' },
    ];

    const formattedData = calibrations.map(item => ({
        ...item,
        assetnumber: (
            <Link 
                href={`/asset/${item.assetnumber}`}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
                {item.assetnumber}
            </Link>
        ),
        assetmanufacturer: (
            <span className="text-teal-300 font-medium">
                {item.assetmanufacturer}
            </span>
        ),
        assetstatus: (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.assetstatus === 'Active' 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : item.assetstatus === 'Under Repair'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : item.assetstatus === 'Retired'
                    ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                    : item.assetstatus === 'In Calibration'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    : 'bg-white/10 text-slate-300 border border-white/20'
            }`}>
                {item.assetstatus}
            </span>
        ),
        calibrationdate: format(new Date(item.calibrationdate), 'dd/MM/yyyy'),
        calibrationtodate: format(new Date(item.calibrationtodate), 'dd/MM/yyyy'),
    }));

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
            {/* Animated background canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            
            {/* Main content */}
            <div className="relative z-20 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
                            Active Calibrations Report
                        </h1>
                        <p className="text-white text-lg">
                            View all equipment with active calibration certificates. Track calibration validity and manage compliance.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
                                <div className="text-2xl font-bold text-teal-400">{calibrations.length}</div>
                                <div className="text-white text-sm uppercase tracking-wider">Active Calibrations</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                        <div className="p-6 lg:p-8">
                            <ResponsiveTable
                                columns={columns}
                                data={formattedData}
                                sortField={sortField}
                                sortOrder={sortOrder}
                                onSort={toggleSort}
                                variant="glassmorphic"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 