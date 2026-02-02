import { NextResponse } from 'next/server';
import { getClubMatches } from '@/lib/ourproclub-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const matchType = searchParams.get('matchType'); // Optional filter

    let matches = await getClubMatches(clubId, limit);

    // Filter by match type if specified
    if (matchType) {
      matches = matches.filter(m => m.matchType === matchType);
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Match fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
