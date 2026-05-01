import axios from 'axios';

const tags = ['hypixel', 'skyblock'];
const GAME_ID = '27471';

async function getToken() {
  const res = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
    params: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials'
    }
  });
  return res.data.access_token;
}

export default async function GetStreams() {
  try {
    const at = await getToken();
    const headers = {
      Authorization: `Bearer ${at}`,
      'Client-Id': process.env.CLIENT_ID
    };

    let filtered: any[] = [];
    let cursor: string | null = null;
    let pages = 0;
    const MAX_PAGES = 10;

    while (filtered.length < 20 && pages < MAX_PAGES) {
      const params: any = { game_id: GAME_ID, type: 'live', first: 100 };
      if (cursor) params.after = cursor;

      const res = await axios.get(`https://api.twitch.tv/helix/streams`, { headers, params });

      const streams: any[] = res.data.data;
      const pagination = res.data.pagination;

      const matches = streams.filter((stream) => {
        const title = stream.title.toLowerCase();
        return tags.every((tag) => title.includes(tag));
      });

      filtered = [...filtered, ...matches];

      // Normalize thumbnail URLs
        filtered = filtered.map((s) => ({
        ...s,
        thumbnail_url: s.thumbnail_url
            .replace('{width}', '440')
            .replace('{height}', '248')
        }))
      cursor = pagination?.cursor ?? null;
      pages++;

      if (!cursor || streams.length === 0) break;
    }

    // Deduplicate by stream id
    filtered = [...new Map(filtered.map((s) => [s.id, s])).values()];

    filtered.sort((a, b) => b.viewer_count - a.viewer_count);

    console.log(filtered)
    return filtered;
  } catch (err) {
    console.error(err);
    return [];
  }
}