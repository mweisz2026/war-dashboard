import type { Quote } from './types';
import { FRED_SERIES } from './tickers';

const BASE = 'https://api.stlouisfed.org/fred/series/observations';

interface FredObs {
  date: string;
  value: string;
}

// Next.js extends RequestInit with `next` for ISR cache control
type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

async function fetchSeries(
  seriesId: string,
  apiKey: string
): Promise<{ current: number; previous: number }> {
  const url = `${BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=5&sort_order=desc`;
  const res = await fetch(url, { next: { revalidate: 3600 } } as NextFetchInit);
  if (!res.ok) throw new Error(`FRED ${seriesId}: ${res.status}`);
  const data: { observations: FredObs[] } = await res.json();

  const valid = data.observations
    .filter((o) => o.value !== '.' && o.value !== '')
    .map((o) => parseFloat(o.value));

  if (valid.length === 0) throw new Error(`No valid observations for ${seriesId}`);
  return { current: valid[0], previous: valid[1] ?? valid[0] };
}

export async function fetchFredQuotes(): Promise<Quote[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return FRED_SERIES.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      category: s.category,
      price: 0,
      change: 0,
      changePercent: 0,
      unit: s.unit,
      source: 'fred' as const,
      error: 'FRED_API_KEY not set',
    }));
  }

  const results = await Promise.allSettled(
    FRED_SERIES.map(async (series) => {
      const { current, previous } = await fetchSeries(series.symbol, apiKey);
      const change = current - previous;
      const changePct = previous !== 0 ? (change / previous) * 100 : 0;

      return {
        symbol: series.symbol,
        name: series.name,
        category: series.category,
        price: current,
        change,
        changePercent: changePct,
        unit: series.unit,
        source: 'fred' as const,
      } satisfies Quote;
    })
  );

  return results.map((r, i): Quote => {
    if (r.status === 'fulfilled') return r.value;
    return {
      symbol: FRED_SERIES[i].symbol,
      name: FRED_SERIES[i].name,
      category: FRED_SERIES[i].category,
      price: 0,
      change: 0,
      changePercent: 0,
      unit: FRED_SERIES[i].unit,
      source: 'fred',
      error: String((r as PromiseRejectedResult).reason),
    };
  });
}

export async function fetchFredHistory(
  seriesId: string,
  startDate: string
): Promise<{ date: string; close: number }[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return [];

  const url =
    `${BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json` +
    `&observation_start=${startDate}&sort_order=asc`;

  const res = await fetch(url, { next: { revalidate: 3600 } } as NextFetchInit);
  if (!res.ok) return [];

  const data: { observations: FredObs[] } = await res.json();
  return data.observations
    .filter((o) => o.value !== '.' && o.value !== '')
    .map((o) => ({ date: o.date, close: parseFloat(o.value) }));
}
