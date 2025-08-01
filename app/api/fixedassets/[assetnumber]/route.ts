import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const asset = await db
      .collection('fixedassets')
      .findOne({ assetnumber: params.assetnumber });

    if (!asset) {
      return NextResponse.json(
        { error: 'Fixed asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Failed to fetch fixed asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixed asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { assetnumber } = params;
    const updateData = await request.json();

    console.log('Processing update for fixed asset:', assetnumber);

    const { db } = await connectToDatabase();

    // First check if the asset exists
    const existingAsset = await db.collection('fixedassets').findOne({ assetnumber });

    if (!existingAsset) {
      console.error('Fixed asset not found in database:', assetnumber);
      return NextResponse.json(
        { error: `Fixed asset ${assetnumber} not found` },
        { status: 404 }
      );
    }

    // Remove immutable and protected fields
    const {
      _id,
      assetnumber: _an,
      acquireddate,
      acquiredvalue,
      assetdescription,
      ...updateFields
    } = updateData;

    console.log('Updating fixed asset with fields:', updateFields);

    const updatedAsset = await db.collection('fixedassets').findOneAndUpdate(
      { assetnumber: assetnumber.toString() }, // Ensure string comparison
      { $set: updateFields },
      { 
        returnDocument: 'after'
      }
    );

    if (!updatedAsset) {
      console.error('Update failed for fixed asset:', assetnumber);
      return NextResponse.json(
        { error: 'Failed to update fixed asset' },
        { status: 500 }
      );
    }

    console.log('Fixed asset updated successfully:', updatedAsset);
    return NextResponse.json(updatedAsset);

  } catch (error) {
    console.error('Error in fixed asset update:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update fixed asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 