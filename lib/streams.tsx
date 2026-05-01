import axios from 'axios';

const GAME_ID = '27471';
const TAGS = ['hypixel', 'skyblock'];
const MAX_PAGES = 40;
const TARGET_COUNT = 20;
const STREAM_CACHE_TTL = 5 * 60 * 1000;
const TOKEN_BUFFER_MS = 60 * 1000;

interface TwitchStream {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  tags: string[];
}

interface TokenCache {
  value: string;
  expiry: number;
}

interface StreamCache {
  data: TwitchStream[];
  expiry: number;
}

let tokenCache: TokenCache | null = null;
let streamCache: StreamCache | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isFetching = false;

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) {
    return tokenCache.value;
  }

  try {
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
  } catch (err) {
    throw new Error(`Failed to fetch Twitch token: ${err}`);
  }
}

function normalizeThumbnail(url: string): string {
  return url.replace('{width}', '440').replace('{height}', '248');
}

function matchesTags(stream: TwitchStream): boolean {
  const title = stream.title.toLowerCase();
  const streamTags = stream.tags?.map((t) => t.toLowerCase()) ?? [];
  return TAGS.every((tag) => title.includes(tag) || streamTags.includes(tag));
}

function scheduleRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = setTimeout(() => {
    fetchAndCacheStreams().catch(console.error);
  }, STREAM_CACHE_TTL);

  if (refreshTimer.unref) refreshTimer.unref();
}

async function fetchAndCacheStreams(): Promise<TwitchStream[]> {
  if (isFetching) {
    return streamCache?.data ?? [];
  }

  isFetching = true;

  try {
    const token = await getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Client-Id': process.env.CLIENT_ID!,
    };

    const seen = new Set<string>();
    const filtered: TwitchStream[] = [];
    let cursor: string | null = null;
    let pages = 0;

    while (filtered.length < TARGET_COUNT && pages < MAX_PAGES) {
      const params: Record<string, string | number> = {
        game_id: GAME_ID,
        type: 'live',
        first: 100,
      };
      if (cursor) params.after = cursor;

      const res = await axios.get('https://api.twitch.tv/helix/streams', {
        headers,
        params,
      });

      const streams: TwitchStream[] = res.data.data;
      const pagination = res.data.pagination;

      for (const stream of streams) {
        if (filtered.length >= TARGET_COUNT) break;
        if (!seen.has(stream.user_id) && matchesTags(stream)) {
          seen.add(stream.user_id);
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

    streamCache = {
      data: filtered,
      expiry: Date.now() + STREAM_CACHE_TTL,
    };

    scheduleRefresh();
    return filtered;
  } catch (err) {
    console.error('Failed to fetch streams:', err);
    return streamCache?.data ?? [];
  } finally {
    isFetching = false;
  }
}

export default async function getStreams(): Promise<TwitchStream[]> {
  if (streamCache && Date.now() < streamCache.expiry) {
    return streamCache.data;
  }

  return fetchAndCacheStreams();
}