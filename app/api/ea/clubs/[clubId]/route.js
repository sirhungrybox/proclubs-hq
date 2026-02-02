import { NextResponse } from 'next/server';
import { getClubStats, getClubMatches, getPlayerStats } from '@/lib/ourproclub-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;

    // Fetch all data in parallel from OurProClub API
    const [stats, matches, players] = await Promise.all([
      getClubStats(clubId, 500).catch(() => null),
      getClubMatches(clubId, 50).catch(() => []),
      getPlayerStats(clubId, 500).catch(() => []),
    ]);

    if (!stats && matches.length === 0) {
      return NextResponse.json({
        error: 'Club not found. Make sure this club uses the OurProClub Discord bot.',
        hint: 'The club must have used /matches or /automode commands to have data available.'
      }, { status: 404 });
    }

    // Transform to match expected format
    const data = {
      info: {
        name: stats?.clubName || matches[0]?.clubName || 'Unknown Club',
        clubId: parseInt(clubId),
      },
      stats: stats ? {
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.draws,
        goals: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        cleanSheets: stats.cleanSheets,
        gamesPlayed: stats.totalMatches,
        winRate: stats.winRate,
        goalDifference: stats.goalDifference,
        avgGoalsFor: stats.avgGoalsFor,
        avgGoalsAgainst: stats.avgGoalsAgainst,
        recentForm: stats.recentForm,
        matchTypes: stats.matchTypes,
      } : null,
      members: {
        members: players.map(p => ({
          name: p.name,
          gamesPlayed: p.matches,
          goals: p.goals,
          assists: p.assists,
          saves: p.saves,
          proPos: p.position,
          manOfTheMatch: p.manOfTheMatch,
          avgRating: p.avgRating,
          passAccuracy: p.passAccuracy,
          tackleSuccess: p.tackleSuccess,
          minutesPlayed: p.minutesPlayed,
          cleanSheets: p.cleanSheets,
          redCards: p.redCards,
        })),
      },
      matches: matches.map(m => ({
        matchId: m.id,
        timestamp: m.timestamp,
        matchType: m.matchType,
        result: m.result,
        score: m.score,
        opponent: m.opponent,
        players: m.players,
      })),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Club data error:', error);
    return NextResponse.json({
      error: 'Failed to fetch club data from OurProClub API.',
      message: error.message
    }, { status: 503 });
  }
}
