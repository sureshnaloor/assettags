import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { projectId } = body;
    const { db } = await connectToDatabase();

    // Log the query we're about to execute
    console.log('MongoDB query:', {
      project: projectId,
      custodyto: null
    });

    const equipment = await db.collection('equipmentcustody')
      .find({
        project: projectId,  // This will now match "WBS - PROJECTNAME" format
        custodyto: null
      })
      .toArray();

    // Log the results
    console.log('Found equipment count:', equipment.length);
    if (equipment.length > 0) {
      console.log('Sample record:', equipment[0]);
    }

    return NextResponse.json({ equipment });
  } catch (error) {
    console.error('Error fetching project equipment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 