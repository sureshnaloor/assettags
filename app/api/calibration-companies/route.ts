import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';


export const dynamic = 'force-dynamic';

const COLLECTION = 'calibrationcompanies';

function normalizeText(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse };
  }
  return { email: session.user.email };
}

async function nextCompanyCode(collection: {
  find: (filter: object) => { project: (p: object) => { toArray: () => Promise<Array<{ code?: string }>> } };
}) {
  const rows = await collection.find({}).project({ code: 1 }).toArray();
  let max = 0;
  for (const row of rows) {
    const match = String(row.code ?? '').match(/(\d+)\s*$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `CALIB-${String(max + 1).padStart(3, '0')}`;
}

async function findDuplicate(
  collection: {
    findOne: (filter: object) => Promise<Record<string, unknown> | null>;
  },
  field: 'name' | 'code',
  value: string,
  excludeId?: ObjectId
) {
  const keyField = field === 'name' ? 'nameKey' : 'codeKey';
  const filter: Record<string, unknown> = {
    $or: [
      { [keyField]: normalizeKey(value) },
      { [field]: { $regex: `^${escapeRegex(value)}$`, $options: 'i' } },
    ],
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return collection.findOne(filter);
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const companies = await db
      .collection(COLLECTION)
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Failed to fetch calibration companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibration companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSession();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const name = normalizeText(body?.name);
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    const duplicateName = await findDuplicate(collection, 'name', name);
    if (duplicateName) {
      return NextResponse.json({ error: 'A company with this name already exists' }, { status: 400 });
    }

    let code = normalizeText(body?.code);
    if (!code) {
      code = await nextCompanyCode(collection);
    }
    const duplicateCode = await findDuplicate(collection, 'code', code);
    if (duplicateCode) {
      return NextResponse.json({ error: 'A company with this code already exists' }, { status: 400 });
    }

    const now = new Date();
    const doc = {
      code,
      codeKey: normalizeKey(code),
      name,
      nameKey: normalizeKey(name),
      address: normalizeText(body?.address),
      city: normalizeText(body?.city),
      country: normalizeText(body?.country),
      createdAt: now,
      createdBy: auth.email,
      updatedAt: now,
      updatedBy: auth.email,
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json({ _id: result.insertedId, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Error creating calibration company:', error);
    return NextResponse.json({ error: 'Failed to create calibration company' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSession();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const id = String(body?._id ?? '').trim();
    const name = normalizeText(body?.name);
    if (!id || !name) {
      return NextResponse.json({ error: 'Company ID and name are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const duplicateName = await findDuplicate(collection, 'name', name, objectId);
    if (duplicateName) {
      return NextResponse.json({ error: 'A company with this name already exists' }, { status: 400 });
    }

    let code = normalizeText(body?.code);
    if (!code) {
      const current = await collection.findOne({ _id: objectId });
      code = normalizeText(current?.code) || (await nextCompanyCode(collection));
    }
    const duplicateCode = await findDuplicate(collection, 'code', code, objectId);
    if (duplicateCode) {
      return NextResponse.json({ error: 'A company with this code already exists' }, { status: 400 });
    }

    const updateDoc = {
      code,
      codeKey: normalizeKey(code),
      name,
      nameKey: normalizeKey(name),
      address: normalizeText(body?.address),
      city: normalizeText(body?.city),
      country: normalizeText(body?.country),
      updatedAt: new Date(),
      updatedBy: auth.email,
    };

    const result = await collection.updateOne({ _id: objectId }, { $set: updateDoc });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ _id: id, ...updateDoc });
  } catch (error) {
    console.error('Error updating calibration company:', error);
    return NextResponse.json({ error: 'Failed to update calibration company' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireSession();
    if ('error' in auth) return auth.error;

    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection(COLLECTION).deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Calibration company deleted successfully' });
  } catch (error) {
    console.error('Error deleting calibration company:', error);
    return NextResponse.json({ error: 'Failed to delete calibration company' }, { status: 500 });
  }
}
