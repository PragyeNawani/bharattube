import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Video } from '@/models/Video';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { title, description, videoUrl, thumbnailUrl, tags } = await request.json();

    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: 'Title and video URL are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne({ email: decoded.email });

    const video = new Video(
      title,
      description,
      videoUrl,
      thumbnailUrl,
      tags,
      decoded.userId,
      user.username
    );

    const result = await db.collection('videos').insertOne(video);

    return NextResponse.json(
      { message: 'Video uploaded successfully', videoId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error uploading video', error: error.message },
      { status: 500 }
    );
  }
}