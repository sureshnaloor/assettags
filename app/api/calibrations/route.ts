import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import type { Calibration } from '@/types/asset';

// GET all calibrations
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const calibrations = await db.collection('equipmentcalibcertificates').find({}).toArray();
    return NextResponse.json(calibrations);
  } catch (err) {
    console.error('Failed to fetch calibrations:', err);
    return NextResponse.json(
      { error: 'Failed to fetch calibrations' },
      { status: 500 }
    );
  }
}

// POST new calibration
export async function POST(request: Request) {
  try {
    const body: Omit<Calibration, '_id'> = await request.json();
    const { db } = await connectToDatabase();
    
    // Create new document without _id (MongoDB will generate it)
    const calibrationData = {
      ...body,
      createdat: new Date(),
    };
    
    const result = await db.collection('equipmentcalibcertificates').insertOne(calibrationData);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Failed to create calibration:', err);
    return NextResponse.json(
      { error: 'Failed to create calibration' },
      { status: 500 }
    );
  }
}
