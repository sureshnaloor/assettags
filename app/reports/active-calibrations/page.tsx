'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto py-6 min-h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Active Calibrations Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('assetnumber')}
                                        className="flex items-center gap-2"
                                    >
                                        Asset Number
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('assetdescription')}
                                        className="flex items-center gap-2"
                                    >
                                        Description
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Calibration Date</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('calibrationtodate')}
                                        className="flex items-center gap-2"
                                    >
                                        Valid Until
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>Calibrated By</TableHead>
                                <TableHead>Certificate No.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calibrations.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.assetnumber}</TableCell>
                                    <TableCell>{item.assetdescription}</TableCell>
                                    <TableCell>{item.assetmodel}</TableCell>
                                    <TableCell>{item.assetmanufacturer}</TableCell>
                                    <TableCell>{format(new Date(item.calibrationdate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{format(new Date(item.calibrationtodate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{item.calibratedby}</TableCell>
                                    <TableCell>{item.calibcertificate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 