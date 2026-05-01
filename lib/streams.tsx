import axios from 'axios';

const GAME_ID = '27471';
const TAGS = ['hypixel', 'skyblock'];
const MAX_PAGES = 30;
const TARGET_COUNT = 20;
const STREAM_CACHE_TTL = 5 * 60 * 1000;
const TOKEN_BUFFER_MS = 60 * 1000;

let tokenCache: { value: string; expiry: number } | null = null;
let streamCache: { data: any[]; expiry: number } | null = null;

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) {
    return tokenCache.value;
  }

  const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
  });

  tokenCache = {
    value: res.data.access_token,
    expiry: Date.now() + res.data.expires_in * 1000 - TOKEN_BUFFER_MS,
  };

  return tokenCache.value;
}

function normalizeThumbnail(url: string): string {
  return url.replace('{width}', '440').replace('{height}', '248');
}

function matchesTags(stream: any): boolean {
  const title = stream.title.toLowerCase();
  return TAGS.every((tag) => title.includes(tag));
}

export default async function GetStreams(): Promise<any[]> {
  if (streamCache && Date.now() < streamCache.expiry) {
    return streamCache.data;
  }

  const token = await getToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Client-Id': process.env.CLIENT_ID,
  };

  const seen = new Set<string>();
  const filtered: any[] = [];
  let cursor: string | null = null;
  let pages = 0;

  while (filtered.length < TARGET_COUNT && pages < MAX_PAGES) {
    const params: any = { game_id: GAME_ID, type: 'live', first: 100 };
    if (cursor) params.after = cursor;

    const res = await axios.get('https://api.twitch.tv/helix/streams', { headers, params });
    const streams: any[] = res.data.data;
    const pagination = res.data.pagination;

    for (const stream of streams) {
      if (!seen.has(stream.id) && matchesTags(stream)) {
        seen.add(stream.id);
        filtered.push({
          ...stream,
          thumbnail_url: normalizeThumbnail(stream.thumbnail_url),
        });
      }
    }

    cursor = pagination?.cursor ?? null;
    pages++;

    if (!cursor || streams.length === 0) break;
  }

  filtered.sort((a, b) => b.viewer_count - a.viewer_count);

  streamCache = { data: filtered, expiry: Date.now() + STREAM_CACHE_TTL };

  return filtered;
}