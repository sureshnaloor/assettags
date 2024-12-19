import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const asset = await db
      .collection('equipmentandtools')
      .findOne({ assetnumber: params.assetnumber });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (err) {
    console.error('Failed to fetch asset:', err);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
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

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Failed to update asset:', err);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('equipment').deleteOne({
      assetnumber: params.assetnumber
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Failed to delete asset:', err);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
