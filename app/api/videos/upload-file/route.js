import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Video } from '@/models/Video';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const videoFile = formData.get('videoFile');
    const thumbnailFile = formData.get('thumbnailFile');
    const tags = JSON.parse(formData.get('tags') || '[]');

    if (!title || !videoFile) {
      return NextResponse.json(
        { message: 'Title and video file are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = `${timestamp}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const videoPath = path.join(uploadsDir, videoFileName);
    const videoPublicUrl = `/uploads/videos/${videoFileName}`;

    // Save video file
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(videoPath, videoBuffer);

    // Handle thumbnail if provided
    let thumbnailPublicUrl = '';
    if (thumbnailFile) {
      const thumbnailFileName = `${timestamp}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);
      thumbnailPublicUrl = `/uploads/thumbnails/${thumbnailFileName}`;
      
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await writeFile(thumbnailPath, thumbnailBuffer);
    }

    // Get user info
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: decoded.email });

    // Create video document
    const video = new Video(
      title,
      description,
      videoPublicUrl,
      thumbnailPublicUrl,
      tags,
      decoded.userId,
      user.username
    );

    // Add uploadType field to distinguish between URL and file uploads
    video.uploadType = 'file';

    const result = await db.collection('videos').insertOne(video);

    return NextResponse.json(
      { message: 'Video uploaded successfully', videoId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Error uploading video', error: error.message },
      { status: 500 }
    );
  }
}

// Set maximum file size (100MB)
export const config = {
  api: {
    bodyParser: false,
  },
};