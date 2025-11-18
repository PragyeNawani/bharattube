// app/api/subscriptions/unsubscribe/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
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

    const { channelUsername } = await request.json();

    if (!channelUsername) {
      return NextResponse.json(
        { message: 'Channel username is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get current user
    const user = await db.collection('users').findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get channel
    const channel = await db.collection('users').findOne({ username: channelUsername });

    if (!channel) {
      return NextResponse.json(
        { message: 'Channel not found' },
        { status: 404 }
      );
    }

    // Delete subscription
    const result = await db.collection('subscriptions').deleteOne({
      subscriberId: user._id.toString(),
      channelId: channel._id.toString()
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Unsubscribed successfully', subscribed: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { message: 'Error unsubscribing', error: error.message },
      { status: 500 }
    );
  }
}