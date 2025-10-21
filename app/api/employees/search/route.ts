import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Employee, PPEApiResponse } from '@/types/ppe';

// GET - Search employees with minimum 5 characters for name search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!search) {
      return NextResponse.json(
        { success: false, error: 'Search term is required' },
        { status: 400 }
      );
    }

    // For name search, require minimum 5 characters
    if (search.length < 5 && !/^\d+$/.test(search)) {
      return NextResponse.json(
        { success: false, error: 'Minimum 5 characters required for name search' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('employees');

    // Build query
    let query: any = {
      active: { $ne: 'N' } // Only active employees
    };

    if (/^\d+$/.test(search)) {
      // If search is numeric, search by employee number
      query.empno = { $regex: search, $options: 'i' };
    } else {
      // If search is text, search by name (minimum 5 characters already validated)
      query.empname = { $regex: search, $options: 'i' };
    }

    // Get results
    const employees = await collection
      .find(query)
      .sort({ empname: 1 })
      .limit(limit)
      .toArray();

    const response: PPEApiResponse<any> = {
      success: true,
      data: {
        records: employees,
        total: employees.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search employees' },
      { status: 500 }
    );
  }
}