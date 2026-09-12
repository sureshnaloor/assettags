import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { assetHeaderLookupStages } from '@/lib/assetHeaderLookup';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { employeeNumber } = body;
    const { db } = await connectToDatabase();

    // Use aggregation pipeline to lookup asset details from both collections
    const equipment = await db.collection('equipmentcustody')
      .aggregate([
        {
          $match: {
            employeenumber: employeeNumber,
            $or: [
              { custodyto: null },
              { custodyto: { $exists: false } },
              { custodyto: '' },
            ],
          }
        },
        ...assetHeaderLookupStages(),
        {
          // Project final fields including asset description
          $project: {
            _id: 1,
            assetnumber: 1,
            employeenumber: 1,
            employeename: 1,
            custodyfrom: 1,
            custodyto: 1,
            project: 1,
            assetdescription: '$assetDetails.assetdescription',
            assetstatus: '$assetDetails.assetstatus',
            assetmodel: '$assetDetails.assetmodel',
            assetmanufacturer: '$assetDetails.assetmanufacturer',
            assetserialnumber: '$assetDetails.assetserialnumber'
          }
        },
        {
          $sort: {
            assetnumber: 1
          }
        }
      ])
      .toArray();

    // Log the results
    console.log('Found equipment count:', equipment.length);
    if (equipment.length > 0) {
      console.log('Sample record:', equipment[0]);
    }

    return NextResponse.json({ equipment });
  } catch (error) {
    console.error('Error fetching user equipment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 