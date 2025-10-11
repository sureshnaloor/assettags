'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Loading from '@/app/components/Loading';
import ResponsiveTable from '@/components/ui/responsive-table';

interface ActiveCalibration {
    assetnumber: string;
    assetdescription: string;
    calibrationdate: string;
    calibrationtodate: string;
    calibratedby: string;
    calibcertificate: string;
    assetmodel: string;
    assetmanufacturer: string;
}

type SortField = 'assetnumber' | 'assetdescription' | 'calibrationtodate';
type SortOrder = 'asc' | 'desc';

export default function ActiveCalibrationsReport() {
    const [calibrations, setCalibrations] = useState<ActiveCalibration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('calibrationtodate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
        <div className="container mx-auto py-6 min-h-screen">
            <div className="flex justify-center items-center h-64">
                <Loading message="Loading active calibrations..." />
            </div>
        </div>
    );
    if (error) return <div>Error: {error}</div>;

    const columns = [
        { key: 'assetnumber', label: 'Asset Number', sortable: true },
        { key: 'assetdescription', label: 'Description', sortable: true },
        { key: 'assetmodel', label: 'Model' },
        { key: 'assetmanufacturer', label: 'Manufacturer' },
        { key: 'calibrationdate', label: 'Calibration Date' },
        { key: 'calibrationtodate', label: 'Valid Until', sortable: true },
        { key: 'calibratedby', label: 'Calibrated By' },
        { key: 'calibcertificate', label: 'Certificate No.' },
    ];

    const formattedData = calibrations.map(item => ({
        ...item,
        calibrationdate: format(new Date(item.calibrationdate), 'dd/MM/yyyy'),
        calibrationtodate: format(new Date(item.calibrationtodate), 'dd/MM/yyyy'),
    }));

    return (
        <div className="container mx-auto py-6 min-h-screen px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Active Calibrations Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveTable
                        columns={columns}
                        data={formattedData}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={toggleSort}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 