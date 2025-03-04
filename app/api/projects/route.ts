import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const projects = await db
      .collection('projects')
      .find({})
      .sort({ projectname: 1 })
      .project({
        _id: 1,
        projectname: 1,
        wbs: 1,
        status: 1
      })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
} 