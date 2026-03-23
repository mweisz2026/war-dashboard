import { NextRequest, NextResponse } from 'next/server';

// Vercel calls this at 10:00 UTC (5am EST) daily per vercel.json
// It just warms the cache — the actual data lives in the other API routes
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const base = req.nextUrl.origin;

    // Warm the market and news caches
    await Promise.all([
      fetch(`${base}/api/market`),
      fetch(`${base}/api/news`),
    ]);

    console.log('[CRON] Cache warmed at', new Date().toISOString());
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error('[CRON] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
