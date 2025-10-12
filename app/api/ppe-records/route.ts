import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PPEIssueRecord, PPEIssueRecordInsert, PPEMaster, Employee, PPEApiResponse } from '@/types/ppe';

// GET - Fetch PPE issue records
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
    const userEmpNumber = searchParams.get('userEmpNumber');
    const ppeId = searchParams.get('ppeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const { db } = await connectToDatabase();
    const collection = db.collection('ppe-records');

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { userEmpName: { $regex: search, $options: 'i' } },
        { userEmpNumber: { $regex: search, $options: 'i' } },
        { ppeName: { $regex: search, $options: 'i' } },
        { ppeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userEmpNumber) {
      query.userEmpNumber = userEmpNumber;
    }
    
    if (ppeId) {
      query.ppeId = ppeId;
    }
    
    if (dateFrom || dateTo) {
      query.dateOfIssue = {};
      if (dateFrom) {
        query.dateOfIssue.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.dateOfIssue.$lte = new Date(dateTo);
      }
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const issueRecords = await collection
      .find(query)
      .sort({ dateOfIssue: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const response: PPEApiResponse<any> = {
      success: true,
      data: {
        records: issueRecords,
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
    console.error('Error fetching PPE issue records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch PPE issue records' },
      { status: 500 }
    );
  }
}

// POST - Create new PPE issue record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userEmpNumber,
      userEmpName,
      dateOfIssue,
      ppeId,
      quantityIssued,
      isFirstIssue,
      issueAgainstDue,
      remarks
    } = body;

    // Validate required fields
    if (!userEmpNumber || !userEmpName || !dateOfIssue || !ppeId || !quantityIssued) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Verify PPE exists and get details
    const ppeMasterCollection = db.collection('ppe-master');
    const ppeMaster = await ppeMasterCollection.findOne({ ppeId, isActive: true }) as PPEMaster | null;
    
    if (!ppeMaster) {
      return NextResponse.json(
        { success: false, error: 'PPE not found or inactive' },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employeesCollection = db.collection('employees');
    const employee = await employeesCollection.findOne({ 
      empno: userEmpNumber,
      active: { $ne: 'N' } // Not resigned/exited
    }) as Employee | null;
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found or inactive' },
        { status: 400 }
      );
    }

    // Get last issue date if not first issue
    let lastIssueDate: Date | undefined;
    if (!isFirstIssue) {
      const recordsCollection = db.collection('ppe-records');
      const lastIssue = await recordsCollection
        .findOne(
          { userEmpNumber, ppeId },
          { sort: { dateOfIssue: -1 } }
        ) as PPEIssueRecord | null;
      lastIssueDate = lastIssue?.dateOfIssue;
    }

    // Get issuer details (assuming current user is the issuer)
    const issuerEmployee = await employeesCollection.findOne({ 
      email: session.user.email 
    }) as Employee | null;

    const newIssueRecord: PPEIssueRecordInsert = {
      userEmpNumber,
      userEmpName,
      dateOfIssue: new Date(dateOfIssue),
      ppeId,
      ppeName: ppeMaster.ppeName,
      quantityIssued,
      isFirstIssue: isFirstIssue || false,
      lastIssueDate,
      issueAgainstDue: issueAgainstDue !== undefined ? issueAgainstDue : true,
      remarks,
      issuedBy: issuerEmployee?.empno || session.user.email,
      issuedByName: issuerEmployee?.empname || session.user.email,
      createdAt: new Date(),
      createdBy: session.user.email
    };

    const collection = db.collection('ppe-records');
    const result = await collection.insertOne(newIssueRecord);

    const response: PPEApiResponse<PPEIssueRecord> = {
      success: true,
      data: { ...newIssueRecord, _id: result.insertedId.toString() },
      message: 'PPE issue record created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating PPE issue record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create PPE issue record' },
      { status: 500 }
    );
  }
}
