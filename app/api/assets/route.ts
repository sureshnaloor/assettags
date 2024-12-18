import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db(process.env.MONGODB_DB);
    const equipment = await db.collection('equipmentandtools').find({}).toArray();
    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment and tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection('equipmentandtools').insertOne(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}
