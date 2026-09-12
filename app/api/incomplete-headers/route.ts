import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  isIncompleteHeader,
  isMmeAssetNumber,
  isBlankString,
  isMissingDate,
  isMissingValue,
  type IncompleteHeaderAssetType,
} from '@/lib/incompleteAssetHeaders';

export const dynamic = 'force-dynamic';

function asAssetNumbers(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => String(value ?? '').trim())
        .filter((value) => value.length > 0)
    )
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as IncompleteHeaderAssetType | null;

    if (!type || !['mme', 'fixedasset'].includes(type)) {
      return NextResponse.json(
        { error: 'Query param "type" is required and must be "mme" or "fixedasset"' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collectionName = type === 'mme' ? 'equipmentandtools' : 'fixedassets';

    const [custodyNumbers, calibrationNumbers] = await Promise.all([
      db.collection('equipmentcustody').distinct('assetnumber'),
      db.collection('equipmentcalibcertificates').distinct('assetnumber'),
    ]);

    const custodySet = new Set(asAssetNumbers(custodyNumbers));
    const calibrationSet = new Set(asAssetNumbers(calibrationNumbers));
    const relatedNumbers = asAssetNumbers(
      Array.from(custodySet).concat(Array.from(calibrationSet))
    ).filter((assetnumber) =>
      type === 'mme' ? isMmeAssetNumber(assetnumber) : !isMmeAssetNumber(assetnumber)
    );

    if (relatedNumbers.length === 0) {
      return NextResponse.json([]);
    }

    const headers = await db
      .collection(collectionName)
      .find({ assetnumber: { $in: relatedNumbers } })
      .toArray();

    const headerByNumber = new Map<string, Record<string, unknown>>();
    for (const header of headers) {
      const assetnumber = String((header as { assetnumber?: unknown }).assetnumber ?? '').trim();
      if (assetnumber) {
        headerByNumber.set(assetnumber, header as Record<string, unknown>);
      }
    }

    const results = relatedNumbers
      .map((assetnumber) => {
        const header = headerByNumber.get(assetnumber) ?? null;
        if (!isIncompleteHeader(header)) return null;

        return {
          assetnumber,
          headerExists: Boolean(header),
          assetdescription: header?.assetdescription ?? null,
          acquireddate: header?.acquireddate ?? null,
          acquiredvalue: header?.acquiredvalue ?? null,
          assetcategory: header?.assetcategory ?? null,
          assetsubcategory: header?.assetsubcategory ?? null,
          assetstatus: header?.assetstatus ?? null,
          hasCustody: custodySet.has(assetnumber),
          hasCalibration: calibrationSet.has(assetnumber),
          missingDescription: !header || isBlankString(header.assetdescription),
          missingDate: !header || isMissingDate(header.acquireddate),
          missingValue: !header || isMissingValue(header.acquiredvalue),
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => a.assetnumber.localeCompare(b.assetnumber, undefined, { numeric: true }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch incomplete asset headers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incomplete asset headers' },
      { status: 500 }
    );
  }
}
