import GetStreams from '@/lib/streams';
import { createHash } from 'crypto';

export async function GET() {
  const streams = await GetStreams();
  const hash = createHash('md5')
    .update(streams.map((s) => s.id).join(','))
    .digest('hex');

  return Response.json({ hash });
}