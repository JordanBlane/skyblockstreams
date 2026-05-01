import { unstable_cache } from 'next/cache';
import GetStreams from '@/lib/streams';

const getCachedStreams = unstable_cache(
  async () => GetStreams(),
  ['twitch-streams'],
  { revalidate: 300 } // 5 minutes
);

export async function GET() {
  const streams = await getCachedStreams();
  return Response.json(streams);
}