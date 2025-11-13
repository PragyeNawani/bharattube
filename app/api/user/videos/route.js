import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user to fetch username
    const user = await db.collection('users').findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch all videos for this user by username
    const videos = await db
      .collection('videos')
      .find({ username: user.username })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate watch time for each video (assuming average watch time is 60% of video length)
    // You can modify this logic based on your actual watch time tracking
    const videosWithStats = videos.map(video => ({
      ...video,
      watchTime: video.watchTime || Math.floor(video.views * 3), // Estimated: 3 minutes per view
    }));

    return NextResponse.json(
      { 
        videos: videosWithStats,
        totalVideos: videosWithStats.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return NextResponse.json(
      { message: 'Error fetching videos', error: error.message },
      { status: 500 }
    );
  }
}