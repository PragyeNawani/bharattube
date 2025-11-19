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

    // Calculate watch time for each video
    // Estimation formula: assume average watch duration is 5 minutes per view
    // Or you can use a percentage-based approach: 60% of video duration × views
    const videosWithStats = videos.map(video => {
      // If video already has watchTime stored in DB, use it
      if (video.watchTime && video.watchTime > 0) {
        return {
          ...video,
          watchTime: video.watchTime
        };
      }
      
      // Otherwise, estimate watch time
      // Option 1: Fixed estimate - 5 minutes per view
      const estimatedWatchTimeMinutes = (video.views || 0) * 5;
      
      // Option 2: If you know average video duration, use this:
      // const avgVideoDuration = 10; // minutes
      // const estimatedWatchTimeMinutes = (video.views || 0) * avgVideoDuration * 0.6; // 60% watch rate
      
      return {
        ...video,
        watchTime: estimatedWatchTimeMinutes
      };
    });

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