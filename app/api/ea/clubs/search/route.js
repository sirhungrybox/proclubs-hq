import { NextResponse } from 'next/server';
import { searchClubs } from '@/lib/ea-api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const platform = searchParams.get('platform') || 'ps5';

    if (!name) {
      return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
    }

    const data = await searchClubs(name, platform);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Club search error:', error);
    return NextResponse.json({
      error: 'EA API unavailable. The EA servers block requests from cloud hosting. Try searching directly on ea.com/fc/pro-clubs',
      blocked: true
    }, { status: 503 });
  }
}
