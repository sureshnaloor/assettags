import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import type { Calibration } from '@/types/asset';

// GET all calibrations
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const calibrations = await db.collection('equipmentcalibcertificates').find({}).toArray();
    return NextResponse.json(calibrations);
  } catch (error) {
    console.error('Failed to fetch calibrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibrations' },
      { status: 500 }
    );
  }
}

// POST new calibration
export async function POST(request: Request) {
  try {
    const body: Calibration = await request.json();
    const { db } = await connectToDatabase();
    
    // Add creation timestamp
    const calibrationData = {
      ...body,
      createdat: new Date(),
    };
    
    // Convert string _id to ObjectId if present
    if (calibrationData._id) {
      delete calibrationData._id; // Remove _id since MongoDB will generate one
    }

    // Cast calibrationData to Document type for MongoDB
    const result = await db.collection('equipmentcalibcertificates').insertOne(calibrationData as any);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create calibration:', error);
    return NextResponse.json(
      { error: 'Failed to create calibration' },
      { status: 500 }
    );
  }
}
