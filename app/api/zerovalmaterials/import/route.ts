import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/auth';

// Function to generate 10-digit material ID from ObjectId
function generateMaterialId(objectId: string): string {
  const hexString = objectId.replace(/^[0-9a-f]{8}/, '');
  const digits = hexString.replace(/[^0-9]/g, '');
  
  if (digits.length >= 10) {
    return digits.substring(0, 10);
  } else {
    const allDigits = objectId.replace(/[^0-9]/g, '');
    return allDigits.padEnd(10, '0').substring(0, 10);
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected headers mapping
    const headerMapping: { [key: string]: string } = {
      'material code': 'materialCode',
      'material description': 'materialDescription',
      'uom': 'uom',
      'quantity': 'quantity',
      'source project': 'sourceProject',
      'source po number': 'sourcePONumber',
      'source issue number': 'sourceIssueNumber',
      'source unit rate': 'sourceUnitRate',
      'remarks': 'remarks'
    };

    const { db } = await connectToDatabase();
    const materials = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const materialData: any = {};

      try {
        headers.forEach((header, index) => {
          const mappedField = headerMapping[header];
          if (mappedField && values[index] !== undefined) {
            if (mappedField === 'quantity' || mappedField === 'sourceUnitRate') {
              materialData[mappedField] = parseFloat(values[index]) || 0;
            } else {
              materialData[mappedField] = values[index];
            }
          }
        });

        // Validate required fields
        if (!materialData.materialCode || !materialData.materialDescription) {
          errors.push(`Row ${i + 1}: Missing required fields (material code or description)`);
          continue;
        }

        // Generate material ID
        const objectId = new ObjectId();
        materialData.materialid = generateMaterialId(objectId.toString());
        materialData._id = objectId;
        materialData.createdBy = session.user.name || session.user.email; // Use name if available, fallback to email
        materialData.createdAt = new Date();
        materialData.updatedAt = new Date();
        materialData.testDocs = []; // Initialize empty array

        materials.push(materialData);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (materials.length === 0) {
      return NextResponse.json(
        { error: 'No valid materials to import', errors },
        { status: 400 }
      );
    }

    // Insert materials into database
    const result = await db.collection('zerovalmaterials').insertMany(materials);

    return NextResponse.json({
      success: true,
      imported: result.insertedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Failed to import zero-value materials:', err);
    return NextResponse.json(
      { error: 'Failed to import zero-value materials' },
      { status: 500 }
    );
  }
}
