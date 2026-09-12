import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  isMmeAssetNumber,
  parseAcquiredValue,
  parseDateInput,
  type IncompleteHeaderAssetType,
} from '@/lib/incompleteAssetHeaders';

function collectionForType(type: IncompleteHeaderAssetType): string {
  return type === 'mme' ? 'equipmentandtools' : 'fixedassets';
}

export async function PATCH(
  request: Request,
  { params }: { params: { assetnumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetnumber = String(params.assetnumber ?? '').trim();
    if (!assetnumber) {
      return NextResponse.json({ error: 'assetnumber is required' }, { status: 400 });
    }

    const body = await request.json();
    const type = body?.type as IncompleteHeaderAssetType | undefined;
    if (!type || !['mme', 'fixedasset'].includes(type)) {
      return NextResponse.json(
        { error: 'Body field "type" is required and must be "mme" or "fixedasset"' },
        { status: 400 }
      );
    }

    const expectedMme = type === 'mme';
    if (isMmeAssetNumber(assetnumber) !== expectedMme) {
      return NextResponse.json(
        { error: `Asset ${assetnumber} does not belong to the ${type} list` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(collectionForType(type));
    const existing = await collection.findOne({ assetnumber });
    const now = new Date();
    const actor = session.user.name || session.user.email;

    if (body?.clear === true) {
      if (!existing) {
        return NextResponse.json({ error: 'Asset header not found' }, { status: 404 });
      }

      const updated = await collection.findOneAndUpdate(
        { assetnumber },
        {
          $unset: {
            assetdescription: '',
            acquireddate: '',
            acquiredvalue: '',
          },
          $set: {
            updatedat: now,
            updatedby: actor,
          },
        },
        { returnDocument: 'after' }
      );

      return NextResponse.json(updated);
    }

    const setFields: Record<string, unknown> = {
      assetnumber,
      updatedat: now,
      updatedby: actor,
    };
    const unsetFields: Record<string, ''> = {};

    if (Object.prototype.hasOwnProperty.call(body, 'assetdescription')) {
      const description = String(body.assetdescription ?? '').trim();
      if (description) {
        setFields.assetdescription = description;
      } else {
        unsetFields.assetdescription = '';
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'acquireddate')) {
      const parsedDate = parseDateInput(body.acquireddate);
      if (parsedDate) {
        setFields.acquireddate = parsedDate;
      } else if (String(body.acquireddate ?? '').trim() !== '') {
        return NextResponse.json({ error: 'acquireddate must be a valid date' }, { status: 400 });
      } else {
        unsetFields.acquireddate = '';
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'acquiredvalue')) {
      const parsedValue = parseAcquiredValue(body.acquiredvalue);
      if (parsedValue != null) {
        setFields.acquiredvalue = parsedValue;
      } else if (body.acquiredvalue !== '' && body.acquiredvalue != null) {
        return NextResponse.json({ error: 'acquiredvalue must be a number' }, { status: 400 });
      } else {
        unsetFields.acquiredvalue = '';
      }
    }

    if (!existing) {
      setFields.createdat = now;
      setFields.createdby = actor;
      if (!setFields.assetstatus) {
        setFields.assetstatus = 'Active';
      }
    }

    const update: Record<string, unknown> = { $set: setFields };
    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }

    const updated = await collection.findOneAndUpdate(
      { assetnumber },
      update,
      { returnDocument: 'after', upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update incomplete asset header:', error);
    return NextResponse.json(
      { error: 'Failed to update asset header fields' },
      { status: 500 }
    );
  }
}
