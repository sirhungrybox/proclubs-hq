import { NextResponse } from 'next/server';
import { getClubMembers } from '@/lib/ea-api';

export async function GET(request, { params }) {
  try {
    const { clubId } = await params;
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'ps5';

    const members = await getClubMembers(clubId, platform);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
