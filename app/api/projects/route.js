import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all projects with all fields needed by both new and existing components
    const projects = await db.collection('projects')
      .find({})
      .sort({ projectname: 1 })
      .project({
        _id: 1,
        projectname: 1,
        wbs: 1,
        status: 1
      })
      .toArray();

    // Return in a format compatible with both new and existing components
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 