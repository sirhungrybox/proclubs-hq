import { NextResponse } from 'next/server';
import clubsDatabase from '@/data/clubs-database.json';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('name') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

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
