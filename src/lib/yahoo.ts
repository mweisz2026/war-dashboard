/**
 * Yahoo Finance data fetching via the public v7/v8 APIs (no API key needed).
 * We use the HTTP API directly to avoid yahoo-finance2 TypeScript issues.
 */
import type { Quote, HistoricalPoint } from './types';
import { YAHOO_TICKERS } from './tickers';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

// ── Current quotes via v8 chart API (one request per symbol, more reliable) ──

interface YahooChartMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  currency?: string;
}

async function fetchSingleQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=1d`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const data: YahooChartResponse = await res.json();
    const meta = data.chart?.result?.[0]?.meta as YahooChartMeta | undefined;
    if (!meta?.regularMarketPrice) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    return { price, change, changePercent };
  } catch {
    return null;
  }
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  const results = await Promise.allSettled(
    YAHOO_TICKERS.map((ticker) => fetchSingleQuote(ticker.symbol))
  );

  return YAHOO_TICKERS.map((ticker, i): Quote => {
    const r = results[i];
    const data = r.status === 'fulfilled' ? r.value : null;
    if (!data) {
      return {
        symbol: ticker.symbol,
        name: ticker.name,
        category: ticker.category,
        price: 0,
        change: 0,
        changePercent: 0,
        unit: ticker.unit,
        source: 'yahoo',
        error: 'No data',
      };
    }
    return {
      symbol: ticker.symbol,
      name: ticker.name,
      category: ticker.category,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      unit: ticker.unit,
      source: 'yahoo',
    };
  });
}

// ── Historical data via v8 chart endpoint ────────────────────────────────────

type Period = '1mo' | '3mo' | '6mo' | '1y' | '2y' | 'custom';

function getPeriodStart(period: Period, customStart?: string): Date {
  const now = new Date();
  const d = new Date(now);
  if (period === '1mo')  { d.setMonth(d.getMonth() - 1);   return d; }
  if (period === '3mo')  { d.setMonth(d.getMonth() - 3);   return d; }
  if (period === '6mo')  { d.setMonth(d.getMonth() - 6);   return d; }
  if (period === '1y')   { d.setFullYear(d.getFullYear() - 1); return d; }
  if (period === '2y')   { d.setFullYear(d.getFullYear() - 2); return d; }
  if (period === 'custom' && customStart) return new Date(customStart);
  d.setMonth(d.getMonth() - 3);
  return d;
}

interface YahooChartResponse {
  chart: {
    result?: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }>;
    error?: { code: string; description: string };
  };
}

export async function fetchHistory(
  symbol: string,
  period: Period = '3mo',
  customStart?: string
): Promise<HistoricalPoint[]> {
  const start = getPeriodStart(period, customStart);
  const end = new Date();
  const period1 = Math.floor(start.getTime() / 1000);
  const period2 = Math.floor(end.getTime() / 1000);

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${period1}&period2=${period2}`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Yahoo chart API ${symbol}: ${res.status}`);

  const data: YahooChartResponse = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) return [];

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators.quote[0]?.close ?? [];
  const volumes = result.indicators.quote[0]?.volume ?? [];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      close: closes[i] ?? 0,
      volume: volumes[i] ?? undefined,
    }))
    .filter((d) => d.close > 0);
}
