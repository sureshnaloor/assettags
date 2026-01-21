import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const locations = await db
      .collection('locations')
      .find({})
      .sort({ locationName: 1 })
      .toArray();

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, townCity, buildingTower, roomFloorNumber, palletRackBin, remarks } = body;

    if (!locationName || !townCity || !buildingTower || !roomFloorNumber) {
      return NextResponse.json(
        { error: 'Location name, town/city, building/tower, and room/floor number are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Check if location already exists (based on unique combination)
    const existing = await db.collection('locations').findOne({ 
      locationName,
      townCity,
      buildingTower,
      roomFloorNumber
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Location with these details already exists' },
        { status: 400 }
      );
    }

    const newLocation = {
      locationName,
      townCity,
      buildingTower,
      roomFloorNumber,
      palletRackBin: palletRackBin || '',
      remarks: remarks || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('locations').insertOne(newLocation);

    return NextResponse.json(
      { _id: result.insertedId, ...newLocation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, locationName, townCity, buildingTower, roomFloorNumber, palletRackBin, remarks } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    if (!locationName || !townCity || !buildingTower || !roomFloorNumber) {
      return NextResponse.json(
        { error: 'Location name, town/city, building/tower, and room/floor number are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const updateData: any = {
      locationName,
      townCity,
      buildingTower,
      roomFloorNumber,
      updatedAt: new Date(),
    };

    if (palletRackBin !== undefined) updateData.palletRackBin = palletRackBin || '';
    if (remarks !== undefined) updateData.remarks = remarks || '';

    const result = await db.collection('locations').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id,
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('locations').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
