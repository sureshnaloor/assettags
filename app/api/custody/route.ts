import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import type { Custody } from '@/types/custody';

// GET all custody records
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const custodyRecords = await db.collection('equipmentcustody').find({}).toArray();
    return NextResponse.json(custodyRecords);
  } catch (error) {
    console.error('Failed to fetch custody records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custody records' },
      { status: 500 }
    );
  }
}

// POST new custody record
export async function POST(request: Request) {
  try {
    const body: Custody = await request.json();
    const { db } = await connectToDatabase();
    
    // Add creation timestamp
    const custodyData = {
      ...body,
      createdate: new Date(),
    };
    
    const result = await db.collection('equipmentcustody').insertOne(custodyData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create custody record:', error);
    return NextResponse.json(
      { error: 'Failed to create custody record' },
      { status: 500 }
    );
  }
} 