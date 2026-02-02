const EA_API_BASE = 'https://proclubs.ea.com/api/fc';

const EA_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.ea.com',
  'Referer': 'https://www.ea.com/',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export const PLATFORMS = {
  'ps5': 'common-gen5',
  'xbox-series': 'common-gen5',
  'pc': 'common-gen5',
  'ps4': 'ps4',
  'xbox-one': 'xboxone',
};

export const PLATFORM_LABELS = {
  'ps5': 'PlayStation 5',
  'xbox-series': 'Xbox Series X|S',
  'pc': 'PC',
  'ps4': 'PlayStation 4',
  'xbox-one': 'Xbox One',
};

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function eaFetch(endpoint, params = {}) {
  const url = new URL(`${EA_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url.toString(), {
    headers: EA_HEADERS,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`EA API Error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Check if response is HTML (blocked)
  if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('Access Denied')) {
    throw new Error('EA API blocked request - server IP not allowed');
  }

  const data = JSON.parse(text);
  setCache(cacheKey, data);
  return data;
}

export async function searchClubs(clubName, platform) {
  const platformCode = PLATFORMS[platform] || platform;
  return eaFetch('/clubs/search', { clubName, platform: platformCode });
}

export async function getClubInfo(clubId, platform) {
  const platformCode = PLATFORMS[platform] || platform;
  const data = await eaFetch('/clubs/info', { clubIds: clubId, platform: platformCode });
  return data[clubId] || null;
}

export async function getClubStats(clubId, platform) {
  const platformCode = PLATFORMS[platform] || platform;
  const data = await eaFetch('/clubs/stats', { clubIds: clubId, platform: platformCode });
  return data[clubId] || null;
}

export async function getClubSeasonalStats(clubId, platform) {
  const platformCode = PLATFORMS[platform] || platform;
  const data = await eaFetch('/clubs/seasonalStats', { clubIds: clubId, platform: platformCode });
  return data[clubId] || null;
}

export async function getClubMembers(clubId, platform) {
  const platformCode = PLATFORMS[platform] || platform;
  return eaFetch('/members/stats', { clubId, platform: platformCode });
}

export async function getClubMatches(clubId, platform, matchType = 'leagueMatch') {
  const platformCode = PLATFORMS[platform] || platform;
  const data = await eaFetch('/clubs/matches', {
    clubIds: clubId,
    platform: platformCode,
    matchType
  });
  return data[clubId] || [];
}

export async function getFullClubData(clubId, platform) {
  const [info, stats, seasonalStats, members, matches] = await Promise.all([
    getClubInfo(clubId, platform).catch(() => null),
    getClubStats(clubId, platform).catch(() => null),
    getClubSeasonalStats(clubId, platform).catch(() => null),
    getClubMembers(clubId, platform).catch(() => null),
    getClubMatches(clubId, platform).catch(() => []),
  ]);

  return { info, stats, seasonalStats, members, matches };
}

// Find match between two clubs
export async function findMatchBetweenClubs(club1Id, club2Id, platform, matchType = 'leagueMatch') {
  const matches = await getClubMatches(club1Id, platform, matchType);

  return matches.find(match => {
    const clubIds = Object.keys(match.clubs);
    return clubIds.includes(String(club1Id)) && clubIds.includes(String(club2Id));
  }) || null;
}
