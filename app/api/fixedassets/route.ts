import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'assetnumber';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    // Create search query
    const query = search
      ? {
          $or: [
            { assetnumber: { $regex: search, $options: 'i' } },
            { assetdescription: { $regex: search, $options: 'i' } },          
            
          ],
        }
      : {};

    // Get total count for pagination
    const total = await db.collection('fixedassets').countDocuments(query);

    // Get sorted and paginated assets
    const assets = await db
      .collection('fixedassets')
      .find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      assets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Failed to fetch fixed assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixed assets' },
      { status: 500 }
    );
  }
} 