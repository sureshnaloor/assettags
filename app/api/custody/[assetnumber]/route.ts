import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET custody records for specific asset
export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    console.log('Fetching custody for asset:', params.assetnumber);
    
    const { db } = await connectToDatabase();
    const custodyRecords = await db
      .collection('equipmentcustody')
      .find({ assetnumber: params.assetnumber })
      .sort({ custodyfrom: -1 }) // Sort by custody date, newest first
      .toArray();

    if (!custodyRecords.length) {
      return NextResponse.json(
        { error: 'No custody records found' },
        { status: 404 }
      );
    }

    console.log('Found custody records:', custodyRecords.length);
    return NextResponse.json(custodyRecords);
  } catch (error) {
    console.error('Failed to fetch custody records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custody records' },
      { status: 500 }
    );
  }
}

// PUT (update) custody record
export async function PUT(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const result = await db.collection('equipmentcustody').updateOne(
      { assetnumber: params.assetnumber },
      { 
        $set: {
          ...body,
          custodyfrom: new Date(body.custodyfrom) // Ensure date is properly formatted
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Custody record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update custody record:', error);
    return NextResponse.json(
      { error: 'Failed to update custody record' },
      { status: 500 }
    );
  }
}

// DELETE custody record
export async function DELETE(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('equipmentcustody').deleteOne({
      assetnumber: params.assetnumber
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Custody record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete custody record:', error);
    return NextResponse.json(
      { error: 'Failed to delete custody record' },
      { status: 500 }
    );
  }
} 