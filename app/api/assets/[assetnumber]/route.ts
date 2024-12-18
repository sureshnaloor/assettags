import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    // Log the incoming request
    console.log('API Route: Fetching asset/equipment number:', params.assetnumber);

    // Test MongoDB connection
    const { db } = await connectToDatabase();
    console.log('MongoDB connection successful');

    // Attempt to find the asset
    const equipment = await db.collection('equipmentandtools').findOne({ 
      assetnumber: params.assetnumber 
    });
    
    console.log('Query result:', equipment);

    if (!equipment) {
      console.log('equipment not found');
      return NextResponse.json(
        { error: 'Equipment not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(equipment);

  } catch (error) {
    // Log the full error
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch equipment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const result = await db.collection('equipmentandtools').updateOne(
      { assetnumber: params.assetnumber },
      { $set: body }
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('equipmentandtools').deleteOne({ assetnumber: params.assetnumber });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
