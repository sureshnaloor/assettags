import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const { db } = await connectToDatabase();
    
    const query = category ? { category } : {};
    const subcategories = await db.collection('FIXED_ASSET_SUBCATEGORIES').find(query).toArray();
    return NextResponse.json(subcategories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fixed asset subcategories' }, { status: 500 });
  }
} 