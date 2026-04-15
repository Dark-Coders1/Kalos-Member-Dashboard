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

    if (!scans.length) {
      return NextResponse.json({ scanCount: 0, status: 'No scans yet', bodyFatDelta: null, leanMassDelta: null });
    }

    const first = scans[0];
    const last = scans[scans.length - 1];
    const bodyFatDelta = Number((last.bodyFatPercent - first.bodyFatPercent).toFixed(2));
    const leanMassDelta = Number((last.leanMass - first.leanMass).toFixed(2));

    let status = 'Early data';
    if (scans.length >= 3) {
      if (bodyFatDelta < 0 && leanMassDelta >= 0) status = 'Strong progress';
      else if (bodyFatDelta <= 0 || leanMassDelta >= 0) status = 'Steady progress';
      else status = 'Needs adjustment';
    }

    return NextResponse.json({ scanCount: scans.length, status, bodyFatDelta, leanMassDelta });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
