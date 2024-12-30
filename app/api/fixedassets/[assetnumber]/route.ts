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
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const result = await db.collection('fixedassets').updateOne(
      { assetnumber: params.assetnumber },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Fixed asset not found' },
        { status: 404 }
      );
    }

    const updatedAsset = await db
      .collection('fixedassets')
      .findOne({ assetnumber: params.assetnumber });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Failed to update fixed asset:', error);
    return NextResponse.json(
      { error: 'Failed to update fixed asset' },
      { status: 500 }
    );
  }
} 