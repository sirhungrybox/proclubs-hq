import { NextResponse } from 'next/server';
import clubsDatabase from '@/data/clubs-database.json';

// Security constants
const MAX_LIMIT = 500;
const MAX_QUERY_LENGTH = 100;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Input validation: limit query length to prevent abuse
    const rawQuery = searchParams.get('name') || searchParams.get('query') || '';
    const query = rawQuery.substring(0, MAX_QUERY_LENGTH);

    // Input validation: cap limit to prevent DoS
    const requestedLimit = parseInt(searchParams.get('limit') || '20');
    const limit = Math.min(Math.max(1, requestedLimit || 20), MAX_LIMIT);

    if (!query.trim()) {
      return NextResponse.json({
        clubs: [],
        total: clubsDatabase.totalClubs,
        message: 'Please provide a search query'
      });
    }

    const searchLower = query.toLowerCase().trim();

    // Search clubs by name (fuzzy matching)
    const matches = clubsDatabase.clubs
      .filter(club => club.name.toLowerCase().includes(searchLower))
      .slice(0, limit)
      .map(club => ({
        clubId: club.id,
        name: club.name,
      }));

    return NextResponse.json({
      clubs: matches,
      total: matches.length,
      query: query,
      databaseSize: clubsDatabase.totalClubs,
      lastUpdated: clubsDatabase.lastUpdated,
    });
  } catch (error) {
    console.error('Club search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
