/**
 * Yahoo Finance data fetching via the public v7/v8 APIs (no API key needed).
 * We use the HTTP API directly to avoid yahoo-finance2 TypeScript issues.
 */
import type { Quote, HistoricalPoint } from './types';
import { YAHOO_TICKERS } from './tickers';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; war-dashboard/1.0)',
  'Accept': 'application/json',
};

// ── Current quotes via v7 batch endpoint ─────────────────────────────────────

interface YahooQuoteResult {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  shortName?: string;
  longName?: string;
}

interface YahooQuoteResponse {
  quoteResponse: {
    result: YahooQuoteResult[];
    error: unknown;
  };
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  // Yahoo allows batch quote requests, up to ~200 symbols at once
  const symbols = YAHOO_TICKERS.map((t) => t.symbol).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;

  let rawResults: YahooQuoteResult[] = [];
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) {
      const data: YahooQuoteResponse = await res.json();
      rawResults = data.quoteResponse?.result ?? [];
    }
  } catch {
    // Will fall back to per-ticker fetch below
  }

  // If batch failed or returned partial results, fill in gaps individually
  const resultMap = new Map(rawResults.map((r) => [r.symbol, r]));

  const missing = YAHOO_TICKERS.filter((t) => !resultMap.has(t.symbol));
  if (missing.length > 0) {
    const individual = await Promise.allSettled(
      missing.map(async (ticker) => {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker.symbol)}`,
          { headers: HEADERS }
        );
        if (!r.ok) throw new Error(`${r.status}`);
        const d: YahooQuoteResponse = await r.json();
        return d.quoteResponse?.result?.[0];
      })
    );
    individual.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        resultMap.set(missing[i].symbol, r.value);
      }
    });
  }

  return YAHOO_TICKERS.map((ticker): Quote => {
    const q = resultMap.get(ticker.symbol);
    if (!q) {
      return {
        symbol: ticker.symbol,
        name: ticker.name,
        category: ticker.category,
        price: 0,
        change: 0,
        changePercent: 0,
        unit: ticker.unit,
        source: 'yahoo',
        error: 'Not found',
      };
    }
    return {
      symbol: ticker.symbol,
      name: ticker.name,
      category: ticker.category,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
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
