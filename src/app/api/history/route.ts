import { NextRequest, NextResponse } from 'next/server';
import { fetchHistory } from '@/lib/yahoo';
import { fetchFredHistory } from '@/lib/fred';
import { FRED_SERIES } from '@/lib/tickers';

export const revalidate = 3600; // 1 hour cache

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol');
  const period = (searchParams.get('period') as '1mo' | '3mo' | '6mo' | '1y' | '2y' | 'custom') ?? '3mo';
  const customStart = searchParams.get('start') ?? undefined;

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  try {
    const isFred = FRED_SERIES.some((s) => s.symbol === symbol);

    if (isFred) {
      // Determine start date from period
      const startMap: Record<string, number> = { '1mo': 1, '3mo': 3, '6mo': 6, '1y': 12, '2y': 24 };
      const months = startMap[period] ?? 3;
      const startDate = customStart ?? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - months);
        return d.toISOString().slice(0, 10);
      })();
      const data = await fetchFredHistory(symbol, startDate);
      return NextResponse.json({ symbol, data });
    }

    const data = await fetchHistory(symbol, period, customStart);
    return NextResponse.json({ symbol, data });
  } catch (err) {
    console.error('History API error:', err);
    return NextResponse.json({ error: 'Failed to fetch history', detail: String(err) }, { status: 500 });
  }
}
