import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const employees = await db
      .collection('employees')
      .find({})
      .project({ empno: 1, empname: 1 })
      .toArray();

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' }, 
      { status: 500 }
    );
  }
} 