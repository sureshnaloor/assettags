import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET - List / search non-employee users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const { db } = await connectToDatabase();
    const collection = db.collection('nonemployeeusermaster');

    let query: Record<string, unknown> = {
      active: { $ne: false },
    };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        ...query,
        $or: [
          { visitorNumber: regex },
          { name: regex },
          { nationalId: regex },
          { passportNumber: regex },
          { companySerialNumber: regex },
          { userType: regex },
        ],
      };
    }

    const users = await collection.find(query).sort({ name: 1 }).limit(limit).toArray();

    return NextResponse.json({
      success: true,
      data: {
        records: users,
        total: users.length,
      },
    });
  } catch (error) {
    console.error('Error fetching non-employee users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add new non-employee user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { visitorNumber, name, userType, nationalId, passportNumber, companySerialNumber } = body;

    if (!visitorNumber?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Visitor Number and Name are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('nonemployeeusermaster');

    const existing = await collection.findOne({
      visitorNumber: visitorNumber.trim(),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Visitor Number already exists' },
        { status: 400 }
      );
    }

    const newRecord = {
      visitorNumber: visitorNumber.trim(),
      name: name.trim(),
      userType: userType?.trim() || 'visitor', // rental, visitor, contractor, etc.
      nationalId: nationalId?.trim() || '',
      passportNumber: passportNumber?.trim() || '',
      companySerialNumber: companySerialNumber?.trim() || '',
      active: true,
      createdat: new Date(),
      updatedat: new Date(),
    };

    const result = await collection.insertOne(newRecord);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newRecord },
    });
  } catch (error) {
    console.error('Error creating non-employee user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update non-employee user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { visitorNumber, name, userType, nationalId, passportNumber, companySerialNumber, active } = body;

    if (!visitorNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Visitor Number is required for update' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('nonemployeeusermaster');

    const updateDoc: Record<string, unknown> = {
      updatedat: new Date(),
    };
    if (name !== undefined) updateDoc.name = name.trim();
    if (userType !== undefined) updateDoc.userType = userType.trim();
    if (nationalId !== undefined) updateDoc.nationalId = nationalId.trim();
    if (passportNumber !== undefined) updateDoc.passportNumber = passportNumber.trim();
    if (companySerialNumber !== undefined) updateDoc.companySerialNumber = companySerialNumber.trim();
    if (active !== undefined) updateDoc.active = active;

    const result = await collection.updateOne(
      { visitorNumber: visitorNumber.trim() },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Non-employee user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating non-employee user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
