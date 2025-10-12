import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PPEMaster, PPEApiResponse } from '@/types/ppe';

// GET - Fetch all PPE master records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const { db } = await connectToDatabase();
    const collection = db.collection('ppe-master');

    // Build query
    let query: any = {};
    if (search) {
      query.$or = [
        { ppeName: { $regex: search, $options: 'i' } },
        { ppeId: { $regex: search, $options: 'i' } },
        { materialCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (active !== null && active !== undefined) {
      query.isActive = active === 'true';
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const ppeRecords = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const response: PPEApiResponse<any> = {
      success: true,
      data: {
        records: ppeRecords,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching PPE master records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch PPE master records' },
      { status: 500 }
    );
  }
}

// POST - Create new PPE master record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ppeId, ppeName, materialCode, life, lifeUOM, description, category } = body;

    // Validate required fields
    if (!ppeId || !ppeName || !materialCode || !life || !lifeUOM) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate life UOM
    if (!['week', 'month', 'year'].includes(lifeUOM)) {
      return NextResponse.json(
        { success: false, error: 'Invalid life UOM. Must be week, month, or year' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('ppe-master');

    // Check if PPE ID already exists
    const existingPPE = await collection.findOne({ ppeId });
    if (existingPPE) {
      return NextResponse.json(
        { success: false, error: 'PPE ID already exists' },
        { status: 400 }
      );
    }

    const newPPE: PPEMaster = {
      ppeId,
      ppeName,
      materialCode,
      life,
      lifeUOM,
      description,
      category,
      isActive: true,
      createdAt: new Date(),
      createdBy: session.user.email
    };

    const result = await collection.insertOne(newPPE);

    const response: PPEApiResponse<PPEMaster> = {
      success: true,
      data: { ...newPPE, _id: result.insertedId.toString() },
      message: 'PPE master record created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating PPE master record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create PPE master record' },
      { status: 500 }
    );
  }
}
