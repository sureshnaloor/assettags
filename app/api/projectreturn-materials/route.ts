import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/auth';

function generateMaterialId(objectId: string): string {
  // Extract digits from ObjectId and pad to 10 digits
  const allDigits = objectId.replace(/[^0-9]/g, '');
  if (allDigits.length === 0) {
    // Fallback: use timestamp
    return Date.now().toString().padEnd(10, '0').substring(0, 10);
  }

  return allDigits.padEnd(10, '0').substring(0, 10);
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');
    const materialCode = searchParams.get('materialCode');
    const materialDescription = searchParams.get('materialDescription');

    const { db } = await connectToDatabase();
    
    // Build query based on provided parameters
    const query: any = {};
    if (materialId?.trim()) {
      query.materialid = { $regex: materialId, $options: 'i' };
    }
    if (materialCode?.trim()) {
      query.materialCode = { $regex: materialCode, $options: 'i' };
    }
    if (materialDescription?.trim()) {
      query.materialDescription = { $regex: materialDescription, $options: 'i' };
    }

    const materials = await db
      .collection('projreturnmaterials')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(materials);
  } catch (err) {
    console.error('Failed to fetch project return materials:', err);
    return NextResponse.json(
      { error: 'Failed to fetch project return materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { db } = await connectToDatabase();
    
    // Generate material ID
    const objectId = new ObjectId();
    const materialId = generateMaterialId(objectId.toString());
    
    // Add metadata
    const materialData = {
      ...body,
      _id: objectId,
      materialid: materialId,
      pendingRequests: 0,
      createdBy: session.user.name || session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projreturnmaterials').insertOne(materialData);
    
    return NextResponse.json({ ...result, materialId }, { status: 201 });
  } catch (err) {
    console.error('Failed to create project return material:', err);
    return NextResponse.json(
      { error: 'Failed to create project return material' },
      { status: 500 }
    );
  }
}
