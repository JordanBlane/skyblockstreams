import { NextResponse } from 'next/server';
import getStreams from '@/lib/streams';
import crypto from 'crypto';

export async function GET() {
  const streams = await getStreams();
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(streams.map((s) => s.id + s.viewer_count)))
    .digest('hex');
  return NextResponse.json({ hash });
}