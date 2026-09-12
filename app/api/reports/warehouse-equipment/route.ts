import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { assetHeaderLookupStages } from '@/lib/assetHeaderLookup';
import { openWarehouseMatch } from '@/lib/openCustodyMatch';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sortField = searchParams.get('sortField') || 'assetnumber';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;
        const allowedSort = new Set(['assetnumber', 'assetdescription', 'assetstatus', 'warehouseCity']);
        const resolvedSortField = allowedSort.has(sortField) ? sortField : 'assetnumber';

        const { db } = await connectToDatabase();

        const warehouseEquipment = await db.collection('equipmentcustody')
            .aggregate([
                {
                    $match: openWarehouseMatch(),
                },
                ...assetHeaderLookupStages(),
                {
                    $project: {
                        assetnumber: 1,
                        assetdescription: '$assetDetails.assetdescription',
                        assetstatus: '$assetDetails.assetstatus',
                        assetmodel: '$assetDetails.assetmodel',
                        assetmanufacturer: '$assetDetails.assetmanufacturer',
                        assetserialnumber: '$assetDetails.assetserialnumber',
                        warehouseCity: {
                            $ifNull: [
                                { $cond: [{ $gt: ['$warehouseCity', ''] }, '$warehouseCity', null] },
                                '$custodyCity',
                            ],
                        },
                    },
                },
                {
                    $sort: {
                        [resolvedSortField]: sortOrder,
                    },
                },
            ]).toArray();

        return NextResponse.json(
            { data: warehouseEquipment },
            { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } },
        );
    } catch (error) {
        console.error('Error fetching warehouse equipment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch warehouse equipment' },
            { status: 500 }
        );
    }
}
