import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetNumber = searchParams.get('assetNumber');
    const assetName = searchParams.get('assetName');

    // Return empty array if both parameters are empty or null
    if (!assetNumber?.trim() && !assetName?.trim()) {
      return NextResponse.json([]);
    }
    
    const db = await getDb();
    
    const query: any = {};
    if (assetNumber?.trim()) {
      query.assetnumber = { $regex: assetNumber, $options: 'i' };
    }
    if (assetName?.trim()) {
      query.assetdescription = { $regex: assetName, $options: 'i' };
    }

    const assets = await db
      .collection('equipmentandtools')
      .find(query)
      .toArray();

    return NextResponse.json(assets);
  } catch (err) {
    console.error('Failed to fetch equipments:', err);
    return NextResponse.json(
      { error: 'Failed to fetch equipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const result = await db.collection('equipmentandtools').insertOne(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Failed to create asset:', err);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
