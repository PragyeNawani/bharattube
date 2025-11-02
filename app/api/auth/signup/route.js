import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = new User(username, email, hashedPassword);

    const result = await db.collection('users').insertOne(user);

    return NextResponse.json(
      { message: 'User created successfully', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating user', error: error.message },
      { status: 500 }
    );
  }
}