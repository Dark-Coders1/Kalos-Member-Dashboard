import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import Scan from '@/lib/models/Scan';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDb();
    const scans = await Scan.find({ member: authUser.sub }).sort({ scanDate: 1 }).lean();
    return NextResponse.json(scans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
