import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get unique users from current custody records
    const users = await db.collection('equipmentcustody')
      .aggregate([
        { 
          $match: { 
            $or: [
              { custodyto: null },
              { custodyto: { $exists: false } },
              { custodyto: '' },
            ],
          } 
        },
        {
          $group: {
            _id: '$employeenumber',
            employeenumber: { $first: '$employeenumber' },
            employeename: { $first: '$employeename' }
          }
        },
        {
          $sort: { employeename: 1 }
        }
      ])
      .toArray();

    return NextResponse.json(users, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 