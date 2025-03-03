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

interface WarehouseEquipment {
    assetnumber: string;
    assetdescription: string;
    assetstatus: string;
    assetmodel: string;
    assetmanufacturer: string;
    assetserialnumber: string;
    warehousecity: string;
}

export default function WarehouseEquipmentReport() {
    const [equipment, setEquipment] = useState<WarehouseEquipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWarehouseEquipment();
    }, []);

    const fetchWarehouseEquipment = async () => {
        try {
            const response = await fetch('/api/reports/warehouse-equipment');
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Warehouse Equipment Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Number</TableHead>
                                <TableHead>Description</TableHead>
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
                                    <TableCell>{item.warehousecity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 