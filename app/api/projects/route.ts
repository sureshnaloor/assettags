import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const projects = await db
      .collection('projects')
      .find({})
      .sort({ projectname: 1 })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectname, wbs, status, description } = body;

    if (!projectname || !wbs) {
      return NextResponse.json(
        { error: 'Project name and WBS are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Check if project already exists
    const existing = await db.collection('projects').findOne({ projectname });
    if (existing) {
      return NextResponse.json(
        { error: 'Project with this name already exists' },
        { status: 400 }
      );
    }

    const newProject = {
      projectname,
      wbs,
      status: status || 'active',
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(newProject);

    return NextResponse.json(
      { _id: result.insertedId, ...newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, projectname, wbs, status, description } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const updateData = {
      ...(projectname && { projectname }),
      ...(wbs && { wbs }),
      ...(status && { status }),
      ...(description !== undefined && { description }),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id,
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}