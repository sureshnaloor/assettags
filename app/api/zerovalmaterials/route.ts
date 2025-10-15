import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/auth';

// Function to generate 10-digit material ID from ObjectId
function generateMaterialId(objectId: string): string {
  // Remove the ObjectId prefix and take first 10 digits
  const hexString = objectId.replace(/^[0-9a-f]{8}/, ''); // Remove first 8 chars
  const digits = hexString.replace(/[^0-9]/g, ''); // Keep only digits
  
  // If we don't have enough digits, pad with zeros or use the original ObjectId
  if (digits.length >= 10) {
    return digits.substring(0, 10);
  } else {
    // Use the ObjectId string and extract digits, pad if needed
    const allDigits = objectId.replace(/[^0-9]/g, '');
    return allDigits.padEnd(10, '0').substring(0, 10);
  }
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
      .collection('zerovalmaterials')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(materials);
  } catch (err) {
    console.error('Failed to fetch zero-value materials:', err);
    return NextResponse.json(
      { error: 'Failed to fetch zero-value materials' },
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
    
    // Generate a new ObjectId for the material
    const objectId = new ObjectId();
    const materialId = generateMaterialId(objectId.toString());
    
    // Check if materialid already exists (very unlikely but good practice)
    const existingMaterial = await db.collection('zerovalmaterials').findOne({ materialid: materialId });
    if (existingMaterial) {
      // If exists, generate a new one by appending a suffix
      const newMaterialId = materialId + Math.floor(Math.random() * 100).toString().padStart(2, '0');
      body.materialid = newMaterialId;
    } else {
      body.materialid = materialId;
    }
    
    // Add metadata with user information
    body._id = objectId;
    body.createdBy = session.user.name || session.user.email; // Use name if available, fallback to email
    body.createdAt = new Date();
    body.updatedAt = new Date();
    
    const result = await db.collection('zerovalmaterials').insertOne(body);
    return NextResponse.json({ ...result, materialid: body.materialid }, { status: 201 });
  } catch (err) {
    console.error('Failed to create zero-value material:', err);
    return NextResponse.json(
      { error: 'Failed to create zero-value material' },
      { status: 500 }
    );
  }
}
