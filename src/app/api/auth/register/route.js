import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDb } from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDb();
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: 'Name, valid email, and password (min 6 chars) are required' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'member' });

    return NextResponse.json(
      {
        token: signToken(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
