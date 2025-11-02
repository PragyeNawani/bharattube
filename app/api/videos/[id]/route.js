import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.collection('videos').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    video.views = (video.views || 0) + 1;

    return NextResponse.json({ video }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching video', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { action } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let updateField = {};
    if (action === 'like') {
      updateField = { $inc: { likes: 1 } };
    } else if (action === 'share') {
      updateField = { $inc: { shares: 1 } };
    } else {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    const result = await db.collection('videos').updateOne(
      { _id: new ObjectId(id) },
      updateField
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Video updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating video', error: error.message },
      { status: 500 }
    );
  }
}