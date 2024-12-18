import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const asset = await db
      .collection('equipment')
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
