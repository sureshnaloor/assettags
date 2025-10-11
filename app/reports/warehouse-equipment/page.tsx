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

interface WarehouseEquipment {
    assetnumber: string;
    assetdescription: string;
    assetstatus: string;
    assetmodel: string;
    assetmanufacturer: string;
    assetserialnumber: string;
    warehouseCity: string;
}

type SortField = 'assetnumber' | 'assetdescription';
type SortOrder = 'asc' | 'desc';

export default function WarehouseEquipmentReport() {
    const [equipment, setEquipment] = useState<WarehouseEquipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('assetnumber');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const fetchWarehouseEquipment = async () => {
        try {
            const response = await fetch(`/api/reports/warehouse-equipment?sortField=${sortField}&sortOrder=${sortOrder}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const result = await response.json();
            setEquipment(result.data);
        } catch (err) {
            setError('Failed to load warehouse equipment data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouseEquipment();
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
                    <CardTitle>Warehouse Equipment Report</CardTitle>
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
                                <TableHead>Status</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Warehouse</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipment.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.assetnumber}</TableCell>
                                    <TableCell>{item.assetdescription}</TableCell>
                                    <TableCell>{item.assetstatus}</TableCell>
                                    <TableCell>{item.assetmodel}</TableCell>
                                    <TableCell>{item.assetmanufacturer}</TableCell>
                                    <TableCell>{item.assetserialnumber}</TableCell>
                                    <TableCell>{item.warehouseCity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 