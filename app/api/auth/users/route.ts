import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb-client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database using the new getDb function
    const db = await getDb();
    
    // Fetch users
    const users = await db.collection('authusers')
      .find({})
      .project({ password: 0 }) // Exclude password field
      .toArray();

    // Return response
    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}