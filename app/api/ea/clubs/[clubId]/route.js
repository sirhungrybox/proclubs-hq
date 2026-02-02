import { NextResponse } from 'next/server';
import { getFullClubData } from '@/lib/ea-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'ps5';

    const data = await getFullClubData(clubId, platform);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Club data error:', error);

    // Return mock data for development if EA API is unavailable
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        info: {
          name: 'Demo Club',
          clubId: parseInt((await params).clubId),
          regionId: 4,
          teamId: 1,
        },
        stats: {
          wins: 847,
          losses: 234,
          ties: 89,
          goals: 2891,
          goalsAgainst: 1203,
          cleanSheets: 312,
          seasons: 12,
          bestDivision: 1,
          titlesWon: 5,
          leaguesWon: 3,
          cupsWon: 2,
          promotions: 8,
          relegations: 2,
        },
        seasonalStats: {
          currentDivision: 1,
          bestPoints: 2847,
          gamesPlayed: 45,
          wins: 38,
          losses: 4,
          ties: 3,
          goals: 142,
          goalsAgainst: 34,
          skill_rating: 2847,
          reputationTier: 'Elite',
        },
        members: {
          members: [
            {
              name: 'DemoPlayer1',
              gamesPlayed: 892,
              goals: 423,
              assists: 187,
              proName: 'Star Striker',
              proPos: 'striker',
              proOverall: 89,
              manOfTheMatch: 156,
              favoritePosition: 'ST',
            },
            {
              name: 'DemoPlayer2',
              gamesPlayed: 750,
              goals: 89,
              assists: 312,
              proName: 'Midfield Master',
              proPos: 'midfielder',
              proOverall: 87,
              manOfTheMatch: 98,
              favoritePosition: 'CAM',
            },
            {
              name: 'DemoPlayer3',
              gamesPlayed: 680,
              goals: 12,
              assists: 45,
              proName: 'Solid Defender',
              proPos: 'defender',
              proOverall: 86,
              manOfTheMatch: 67,
              favoritePosition: 'CB',
            }
          ],
        },
        matches: [
          {
            matchId: 'demo1',
            timestamp: Date.now() / 1000,
            clubs: {
              '12847291': {
                name: 'Demo Club',
                goals: 4,
                goalsAgainst: 1,
                possession: 58,
                shots: 14,
                shotsOnTarget: 8,
                passAttempts: 487,
                passSuccesses: 423,
                result: 'win',
              }
            }
          },
          {
            matchId: 'demo2',
            timestamp: Date.now() / 1000 - 3600,
            clubs: {
              '12847291': {
                name: 'Demo Club',
                goals: 2,
                goalsAgainst: 2,
                possession: 52,
                shots: 10,
                shotsOnTarget: 5,
                passAttempts: 420,
                passSuccesses: 378,
                result: 'draw',
              }
            }
          }
        ]
      });
    }

    return NextResponse.json({ error: 'Failed to fetch club data. EA servers may be unavailable.' }, { status: 503 });
  }
}
