import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const assets = await db.collection('equipment').find({}).toArray();
    return NextResponse.json(assets);
  } catch (err) {
    console.error('Failed to fetch assets:', err);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const result = await db.collection('equipment').insertOne(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Failed to create asset:', err);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
