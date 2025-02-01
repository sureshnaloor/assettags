import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const projects = await db
      .collection('projects')
      .find({}).limit(100)
      .project({ wbs: 1, projectname: 1 })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' }, 
      { status: 500 }
    );
  }
} 