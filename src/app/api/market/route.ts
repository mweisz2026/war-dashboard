import { NextResponse } from 'next/server';
import { fetchAllQuotes } from '@/lib/yahoo';
import { fetchFredQuotes } from '@/lib/fred';

export const revalidate = 900; // 15 min cache

export async function GET() {
  try {
    const [yahooQuotes, fredQuotes] = await Promise.all([
      fetchAllQuotes(),
      fetchFredQuotes(),
    ]);

    return NextResponse.json({
      quotes: [...yahooQuotes, ...fredQuotes],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Market API error:', err);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
