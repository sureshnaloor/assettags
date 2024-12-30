import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get all fixed assets
    const fixedAssets = await db
      .collection('fixedassets')
      .find({}).limit(10)
      .toArray();

    return NextResponse.json(fixedAssets);
  } catch (error) {
    console.error('Failed to fetch fixed assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixed assets' },
      { status: 500 }
    );
  }
} 