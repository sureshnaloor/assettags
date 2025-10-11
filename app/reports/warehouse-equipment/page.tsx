'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResponsiveTable from '@/components/ui/responsive-table';
import Link from 'next/link';

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

    const columns = [
        { key: 'assetnumber', label: 'Asset Number', sortable: true },
        { key: 'assetdescription', label: 'Description', sortable: true },
        { key: 'assetstatus', label: 'Status' },
        { key: 'assetmodel', label: 'Model' },
        { key: 'assetmanufacturer', label: 'Manufacturer' },
        { key: 'assetserialnumber', label: 'Serial Number' },
        { key: 'warehouseCity', label: 'Warehouse' },
    ];

    const formattedData = equipment.map(item => ({
        ...item,
        assetnumber: (
            <Link 
                href={`/asset/${item.assetnumber}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
                {item.assetnumber}
            </Link>
        ),
    }));

    return (
        <div className="container mx-auto py-6 min-h-screen px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Warehouse Equipment Report</CardTitle>
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