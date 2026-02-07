import { NextResponse } from 'next/server';
import { getClubMatches } from '@/lib/ourproclub-api';

// Security constants
const MAX_LIMIT = 1000;

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);

    // Input validation: cap limit to prevent DoS
    const requestedLimit = parseInt(searchParams.get('limit') || '50');
    const limit = Math.min(Math.max(1, requestedLimit || 50), MAX_LIMIT);
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
