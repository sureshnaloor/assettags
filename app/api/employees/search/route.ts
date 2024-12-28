import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const { db } = await connectToDatabase();
    
    // Create text index on empno and empname fields (do this once in MongoDB)
    // db.employees.createIndex({ empno: "text", empname: "text" })
    
    const employees = await db.collection('employees')
      .find({
        $or: [
          { empno: { $regex: query, $options: 'i' } },
          { empname: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(10)  // Limit results
      .project({ empno: 1, empname: 1 })
      .toArray();

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
} 