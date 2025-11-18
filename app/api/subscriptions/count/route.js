// app/api/subscriptions/count/route.js
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get user
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Count subscribers
    const subscriberCount = await db.collection('subscriptions').countDocuments({
      channelId: user._id.toString()
    });

    return NextResponse.json(
      { count: subscriberCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return NextResponse.json(
      { message: 'Error getting subscriber count', error: error.message },
      { status: 500 }
    );
  }
}