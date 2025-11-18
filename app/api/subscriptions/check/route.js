// app/api/subscriptions/check/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const { searchParams } = new URL(request.url);
    const channelUsername = searchParams.get('channel');

    if (!channelUsername) {
      return NextResponse.json(
        { message: 'Channel username is required' },
        { status: 400 }
      );
    }

    // If no token, user is not logged in, so not subscribed
    if (!token) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne({ email: decoded.email });
    const channel = await db.collection('users').findOne({ username: channelUsername });

    if (!user || !channel) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    // Check if subscription exists
    const subscription = await db.collection('subscriptions').findOne({
      subscriberId: user._id.toString(),
      channelId: channel._id.toString()
    });

    return NextResponse.json(
      { subscribed: !!subscription },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { subscribed: false },
      { status: 200 }
    );
  }
}