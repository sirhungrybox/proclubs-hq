import { NextResponse } from 'next/server';
import { getClubMatches } from '@/lib/ea-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'ps5';
    const matchType = searchParams.get('matchType') || 'leagueMatch';

    const matches = await getClubMatches(clubId, platform, matchType);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Match fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
