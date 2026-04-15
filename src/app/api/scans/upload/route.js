import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import Scan from '@/lib/models/Scan';
import { getAuthUser } from '@/lib/auth';
import { parseDexaPdf } from '@/lib/pdf';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('scan');
    if (!file) return NextResponse.json({ error: 'scan file is required' }, { status: 400 });
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF uploads are supported' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseDexaPdf(buffer);

    await connectDb();
    const scan = await Scan.create({
      member: authUser.sub,
      scanDate: parsed.scanDate || new Date(),
      weight: parsed.weight,
      bodyFatPercent: parsed.bodyFatPercent,
      leanMass: parsed.leanMass,
      fatMass: parsed.fatMass,
      visceralFat: parsed.visceralFat,
      source: 'pdf-upload',
    });

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
