import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Aggregate pipeline to join collections and get required data
        const warehouseEquipment = await db.collection('equipmentcustody')
            .aggregate([
                {
                    $match: {
                        warehouseCity: { $in: ['Dammam', 'Jubail'] }
                    }
                },
                {
                    $lookup: {
                        from: 'equipmentandtools',
                        localField: 'assetnumber',  // Assuming this is the common field
                        foreignField: 'assetnumber',
                        as: 'equipmentDetails'
                    }
                },
                {
                    $unwind: '$equipmentDetails'
                },
                {
                    $project: {
                        assetnumber: '$equipmentDetails.assetnumber',
                        assetdescription: '$equipmentDetails.assetdescription',
                        assetstatus: '$equipmentDetails.assetstatus',
                        assetmodel: '$equipmentDetails.assetmodel',
                        assetmanufacturer: '$equipmentDetails.assetmanufacturer',
                        assetserialNumber: '$equipmentDetails.assetserialNumber',
                        warehouseCity: 1
                    }
                }
            ]).toArray();

        return NextResponse.json({ data: warehouseEquipment }, { status: 200 });
    } catch (error) {
        console.error('Error fetching warehouse equipment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch warehouse equipment' },
            { status: 500 }
        );
    }
} 