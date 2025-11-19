// app/api/search/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'channel' for exact username match

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let videos;

    // If searching for a specific channel, do exact username match (case-insensitive)
    if (type === 'channel') {
      videos = await db
        .collection('videos')
        .find({
          username: { $regex: `^${query}$`, $options: 'i' }
        })
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      // General search - match title, description, tags, or username
      videos = await db
        .collection('videos')
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error searching videos', error: error.message },
      { status: 500 }
    );
  }
}