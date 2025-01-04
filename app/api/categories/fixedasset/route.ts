import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db.collection('FIXED_ASSET_CATEGORIES').find({}).toArray();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fixed asset categories' }, { status: 500 });
  }
} 