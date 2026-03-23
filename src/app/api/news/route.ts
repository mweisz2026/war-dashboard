import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/news';

export const revalidate = 600; // 10 min cache

export async function GET() {
  try {
    const news = await fetchNews(50);
    return NextResponse.json({ news, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('News API error:', err);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
