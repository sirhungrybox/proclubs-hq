import { NextResponse } from 'next/server';
import { getPlayerStats } from '@/lib/ourproclub-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '500');

    const players = await getPlayerStats(clubId, limit);

    return NextResponse.json({
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
        shots: p.shots,
        passesMade: p.passesMade,
        passAttempts: p.passAttempts,
        tacklesMade: p.tacklesMade,
        tackleAttempts: p.tackleAttempts,
      })),
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
