import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET calibrations for specific asset
export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const calibrations = await db
      .collection('equipmentcalibcertificates')
      .find({ assetnumber: params.assetnumber })
      .toArray();

    if (!calibrations.length) {
      return NextResponse.json(
        { error: 'No calibrations found' },
        { status: 404 }
      );
    }

    return NextResponse.json(calibrations);
  } catch (error) {
    console.error('Failed to fetch calibrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibrations' },
      { status: 500 }
    );
  }
}

// PUT (update) calibration
export async function PUT(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    // Ensure we have an _id to update the specific calibration
    if (!body._id) {
      return NextResponse.json(
        { error: 'Calibration ID is required' },
        { status: 400 }
      );
    }

    // Remove _id from the update body since MongoDB doesn't allow modifying _id
    const { _id, ...updateData } = body;
    
    const result = await db.collection('equipmentcalibcertificates').updateOne(
      { 
        _id: new ObjectId(_id),
        assetnumber: params.assetnumber // Keep this as additional validation
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Calibration not found' },
        { status: 404 }
      );
    }

    // Fetch and return the updated document
    const updatedCalibration = await db
      .collection('equipmentcalibcertificates')
      .findOne({ _id: new ObjectId(_id) });

    return NextResponse.json(updatedCalibration);
  } catch (error) {
    console.error('Failed to update calibration:', error);
    return NextResponse.json(
      { error: 'Failed to update calibration' },
      { status: 500 }
    );
  }
}

// DELETE calibration
export async function DELETE(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('equipmentcalibcertificates').deleteOne({
      assetnumber: params.assetnumber
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Calibration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete calibration:', error);
    return NextResponse.json(
      { error: 'Failed to delete calibration' },
      { status: 500 }
    );
  }
}
