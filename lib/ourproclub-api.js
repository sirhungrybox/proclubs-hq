const OURPROCLUB_API_BASE = 'https://api.ourproclub.app/api';

// Player archetype mappings
export const ARCHETYPES = {
  '1': 'Shot Stopper',
  '2': 'Sweeper Keeper',
  '3': 'Progressor',
  '4': 'Boss',
  '5': 'Engine',
  '6': 'Marauder',
  '7': 'Recycler',
  '8': 'Maestro',
  '9': 'Creator',
  '10': 'Spark',
  '11': 'Magician',
  '12': 'Finisher',
  '13': 'Target',
};

// Match type labels
export const MATCH_TYPES = {
  'leagueMatch': 'Division Rivals',
  'playoffMatch': 'Playoffs',
  'friendlyMatch': 'Friendly',
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

async function opcFetch(endpoint, params = {}) {
  const url = new URL(`${OURPROCLUB_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`OurProClub API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

// Get match history for a club
export async function getMatchHistory(clubId, limit = 100) {
  return opcFetch('/match/history', { clubId, limit: String(limit) });
}

// Transform OurProClub match data to a more usable format
export function transformMatch(match) {
  const clubIds = Object.keys(match.match_data?.clubs || {});
  const clubs = match.match_data?.clubs || {};

  // Find opponent club
  const opponentId = clubIds.find(id => id !== String(match.club_id));
  const ownClub = clubs[match.club_id];
  const opponentClub = opponentId ? clubs[opponentId] : null;

  const ownGoals = parseInt(ownClub?.goals || '0');
  const opponentGoals = parseInt(opponentClub?.goals || '0');

  let result = 'draw';
  if (ownGoals > opponentGoals) result = 'win';
  else if (ownGoals < opponentGoals) result = 'loss';

  // Transform player data
  const players = Object.entries(match.player_data || {}).map(([name, stats]) => ({
    name,
    position: stats.pos,
    archetype: ARCHETYPES[stats.archetypeid] || 'Unknown',
    archetypeId: stats.archetypeid,
    rating: parseFloat(stats.rating) || 0,
    goals: parseInt(stats.goals) || 0,
    assists: parseInt(stats.assists) || 0,
    shots: parseInt(stats.shots) || 0,
    saves: parseInt(stats.saves) || 0,
    passesMade: parseInt(stats.passesmade) || 0,
    passAttempts: parseInt(stats.passattempts) || 0,
    tacklesMade: parseInt(stats.tacklesmade) || 0,
    tackleAttempts: parseInt(stats.tackleattempts) || 0,
    interceptions: parseInt(stats.interceptions) || 0,
    dribbles: parseInt(stats.dribbles) || 0,
    secondAssists: parseInt(stats.secondAssists) || 0,
    redCards: parseInt(stats.redcards) || 0,
    manOfTheMatch: stats.mom === '1',
    cleanSheetGK: parseInt(stats.cleansheetsgk) || 0,
    cleanSheetDef: parseInt(stats.cleansheetsdef) || 0,
    secondsPlayed: parseInt(stats.secondsPlayed) || 0,
    minutesPlayed: Math.round((parseInt(stats.secondsPlayed) || 0) / 60),
  }));

  // Sort players by rating
  players.sort((a, b) => b.rating - a.rating);

  return {
    id: match.id,
    matchId: match.id,
    clubId: match.club_id,
    clubName: match.club_name || ownClub?.clubName || 'Your Club',
    matchType: match.match_type,
    matchTypeLabel: MATCH_TYPES[match.match_type] || match.match_type,
    matchDate: new Date(match.match_date * 1000),
    timestamp: match.match_date,
    result,
    score: {
      own: ownGoals,
      opponent: opponentGoals,
    },
    opponent: opponentClub ? {
      id: opponentId,
      name: opponentClub.clubName,
      goals: opponentGoals,
      winnerByDnf: opponentClub.winnerByDnf === '1',
    } : null,
    winnerByDnf: ownClub?.winnerByDnf === '1',
    players,
  };
}

// Get transformed match history
export async function getClubMatches(clubId, limit = 100) {
  const matches = await getMatchHistory(clubId, limit);
  return matches.map(transformMatch);
}

// Calculate club stats from match history
export async function getClubStats(clubId, limit = 500) {
  const matches = await getClubMatches(clubId, limit);

  if (matches.length === 0) {
    return null;
  }

  const stats = {
    clubId,
    clubName: matches[0]?.clubName || 'Unknown',
    totalMatches: matches.length,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    recentForm: [],
    matchTypes: {},
  };

  matches.forEach((match, index) => {
    // Count results
    if (match.result === 'win') stats.wins++;
    else if (match.result === 'draw') stats.draws++;
    else stats.losses++;

    // Goals
    stats.goalsFor += match.score.own;
    stats.goalsAgainst += match.score.opponent;

    // Clean sheets
    if (match.score.opponent === 0) stats.cleanSheets++;

    // Recent form (last 5)
    if (index < 5) {
      stats.recentForm.push(match.result === 'win' ? 'W' : match.result === 'draw' ? 'D' : 'L');
    }

    // Match types
    stats.matchTypes[match.matchType] = (stats.matchTypes[match.matchType] || 0) + 1;
  });

  stats.winRate = stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 100) : 0;
  stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
  stats.avgGoalsFor = stats.totalMatches > 0 ? (stats.goalsFor / stats.totalMatches).toFixed(1) : 0;
  stats.avgGoalsAgainst = stats.totalMatches > 0 ? (stats.goalsAgainst / stats.totalMatches).toFixed(1) : 0;

  return stats;
}

// Get player stats aggregated from match history
export async function getPlayerStats(clubId, limit = 500) {
  const matches = await getClubMatches(clubId, limit);

  const playerMap = new Map();

  matches.forEach(match => {
    match.players.forEach(player => {
      const existing = playerMap.get(player.name) || {
        name: player.name,
        position: player.position,
        matches: 0,
        goals: 0,
        assists: 0,
        shots: 0,
        saves: 0,
        passesMade: 0,
        passAttempts: 0,
        tacklesMade: 0,
        tackleAttempts: 0,
        redCards: 0,
        manOfTheMatch: 0,
        cleanSheets: 0,
        totalRating: 0,
        minutesPlayed: 0,
      };

      existing.matches++;
      existing.goals += player.goals;
      existing.assists += player.assists;
      existing.shots += player.shots;
      existing.saves += player.saves;
      existing.passesMade += player.passesMade;
      existing.passAttempts += player.passAttempts;
      existing.tacklesMade += player.tacklesMade;
      existing.tackleAttempts += player.tackleAttempts;
      existing.redCards += player.redCards;
      existing.manOfTheMatch += player.manOfTheMatch ? 1 : 0;
      existing.cleanSheets += player.cleanSheetGK + player.cleanSheetDef;
      existing.totalRating += player.rating;
      existing.minutesPlayed += Math.round(player.secondsPlayed / 60);
      existing.position = player.position; // Use most recent position

      playerMap.set(player.name, existing);
    });
  });

  // Calculate averages and sort
  const players = Array.from(playerMap.values()).map(p => ({
    ...p,
    avgRating: p.matches > 0 ? (p.totalRating / p.matches).toFixed(2) : '0.00',
    passAccuracy: p.passAttempts > 0 ? Math.round((p.passesMade / p.passAttempts) * 100) : 0,
    tackleSuccess: p.tackleAttempts > 0 ? Math.round((p.tacklesMade / p.tackleAttempts) * 100) : 0,
  }));

  // Sort by matches played, then by avg rating
  players.sort((a, b) => b.matches - a.matches || parseFloat(b.avgRating) - parseFloat(a.avgRating));

  return players;
}
