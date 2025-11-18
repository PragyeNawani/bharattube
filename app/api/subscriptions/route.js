// app/api/subscriptions/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Subscribe to a user
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

    // Prevent self-subscription
    if (user.username === channelUsername) {
      return NextResponse.json(
        { message: 'Cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    // Check if channel exists
    const channel = await db.collection('users').findOne({ username: channelUsername });

    if (!channel) {
      return NextResponse.json(
        { message: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check if already subscribed
    const existingSubscription = await db.collection('subscriptions').findOne({
      subscriberId: user._id.toString(),
      channelId: channel._id.toString()
    });

    if (existingSubscription) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = {
      subscriberId: user._id.toString(),
      subscriberUsername: user.username,
      channelId: channel._id.toString(),
      channelUsername: channel.username,
      createdAt: new Date()
    };

    await db.collection('subscriptions').insertOne(subscription);

    return NextResponse.json(
      { message: 'Subscribed successfully', subscribed: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json(
      { message: 'Error subscribing', error: error.message },
      { status: 500 }
    );
  }
}

// Get user's subscriptions
export async function GET(request) {
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

    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get all subscriptions for this user
    const subscriptions = await db
      .collection('subscriptions')
      .find({ subscriberId: user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { subscriptions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { message: 'Error fetching subscriptions', error: error.message },
      { status: 500 }
    );
  }
}