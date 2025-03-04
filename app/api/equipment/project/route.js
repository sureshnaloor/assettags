import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { projectId } = await request.json();
    const { db } = await connectToDatabase();

    // Find all equipment custody records for the project where custodyto is null
    const equipment = await db.collection('equipmentcustody')
      .find({
        projectid: projectId,
        custodyto: null
      })
      .toArray();

    return NextResponse.json({ equipment });
  } catch (error) {
    console.error('Error fetching project equipment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 