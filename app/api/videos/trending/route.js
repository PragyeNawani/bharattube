import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const videos = await db
      .collection('videos')
      .find({})
      .sort({ views: -1, likes: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching trending videos', error: error.message },
      { status: 500 }
    );
  }
}