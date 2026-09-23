import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export interface ActualUserOption {
  type: 'employee' | 'non_employee';
  no: string;
  name: string;
  idNumber: string;
  userType: string;
  label: string;
  value: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!search || search.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Search term is required' },
        { status: 400 }
      );
    }

    const searchTerm = search.trim();
    const regex = new RegExp(searchTerm, 'i');
    const { db } = await connectToDatabase();

    // 1. Search employees collection
    let empQuery: Record<string, unknown> = { active: { $ne: 'N' } };
    if (/^\d+$/.test(searchTerm)) {
      empQuery.empno = regex;
    } else {
      empQuery.$or = [{ empname: regex }, { empno: regex }];
    }

    const empPromise = db
      .collection('employees')
      .find(empQuery)
      .sort({ empname: 1 })
      .limit(limit)
      .toArray();

    // 2. Search non-employee user master collection
    const nonEmpQuery: Record<string, unknown> = {
      active: { $ne: false },
      $or: [
        { visitorNumber: regex },
        { name: regex },
        { nationalId: regex },
        { passportNumber: regex },
        { companySerialNumber: regex },
        { userType: regex },
      ],
    };

    const nonEmpPromise = db
      .collection('nonemployeeusermaster')
      .find(nonEmpQuery)
      .sort({ name: 1 })
      .limit(limit)
      .toArray();

    const [empRecords, nonEmpRecords] = await Promise.all([empPromise, nonEmpPromise]);

    const results: ActualUserOption[] = [];

    // Format employee options
    for (const emp of empRecords) {
      results.push({
        type: 'employee',
        no: String(emp.empno || ''),
        name: String(emp.empname || ''),
        idNumber: '',
        userType: 'Employee',
        label: `[Employee] ${emp.empno} - ${emp.empname}`,
        value: `employee:${emp.empno}`,
      });
    }

    // Format non-employee options
    for (const nonEmp of nonEmpRecords) {
      const idParts = [nonEmp.nationalId, nonEmp.passportNumber, nonEmp.companySerialNumber]
        .map((x) => String(x || '').trim())
        .filter(Boolean);
      const idStr = idParts.join(' / ');
      const userTypeLabel = nonEmp.userType ? String(nonEmp.userType).toUpperCase() : 'NON-EMPLOYEE';
      results.push({
        type: 'non_employee',
        no: String(nonEmp.visitorNumber || ''),
        name: String(nonEmp.name || ''),
        idNumber: idStr,
        userType: String(nonEmp.userType || 'visitor'),
        label: `[${userTypeLabel}] ${nonEmp.visitorNumber} - ${nonEmp.name}${idStr ? ` (ID: ${idStr})` : ''}`,
        value: `non_employee:${nonEmp.visitorNumber}`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        records: results.slice(0, limit),
        total: results.length,
      },
    });
  } catch (error) {
    console.error('Error searching actual users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
