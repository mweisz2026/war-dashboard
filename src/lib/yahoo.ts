import type { Quote, HistoricalPoint } from './types';
import { YAHOO_TICKERS } from './tickers';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

interface YahooChartResponse {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        currency?: string;
      };
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

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  weekHigh52?: number;
  weekLow52?: number;
}

// ── Finnhub symbol map ────────────────────────────────────────────────────────

const FINNHUB_MAP: Record<string, string> = {
  'CL=F': 'CL1!', 'BZ=F': 'BZ1!', 'NG=F': 'NG1!', 'HO=F': 'HO1!',
  'RB=F': 'RB1!', 'GC=F': 'GC1!', 'SI=F': 'SI1!', 'PA=F': 'PA1!',
  'PL=F': 'PL1!', 'HG=F': 'HG1!', 'ZC=F': 'ZC1!', 'ZS=F': 'ZS1!',
  'ZW=F': 'ZW1!', 'KE=F': 'KE1!', 'KC=F': 'KC1!', 'SB=F': 'SB1!',
  'CT=F': 'CT1!', 'CC=F': 'CC1!', 'LE=F': 'LE1!', 'HE=F': 'HE1!',
  '^VIX': 'VIX', 'ILS=X': 'FOREX:USDILS', 'DX-Y.NYB': 'USDIDX',
};

async function fetchFinnhub(yahooSymbol: string): Promise<PriceData | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  const symbol = FINNHUB_MAP[yahooSymbol] ?? yahooSymbol;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const d: { c: number; d: number; dp: number; h: number; l: number } = await res.json();
    if (!d.c || d.c === 0) return null;
    return { price: d.c, change: d.d ?? 0, changePercent: d.dp ?? 0, dayHigh: d.h, dayLow: d.l };
  } catch { return null; }
}

async function fetchFromYahoo(symbol: string, host: string): Promise<PriceData | null> {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const data: YahooChartResponse = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    return {
      price,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      weekHigh52: meta.fiftyTwoWeekHigh,
      weekLow52: meta.fiftyTwoWeekLow,
    };
  } catch { return null; }
}

// ── Twelve Data fallback ──────────────────────────────────────────────────────
// Maps Yahoo symbols → Twelve Data symbols (covers futures + forex + indices)

const TWELVE_DATA_MAP: Record<string, string> = {
  'CL=F': 'WTI/USD',    'BZ=F': 'BRENT/USD',  'NG=F': 'XNG/USD',
  'RB=F': 'RBOB/USD',   'HO=F': 'HO/USD',
  'GC=F': 'XAU/USD',    'SI=F': 'XAG/USD',    'PA=F': 'XPD/USD',  'PL=F': 'XPT/USD',
  'HG=F': 'XCU/USD',
  'ZC=F': 'CORN/USD',   'ZS=F': 'SOYBEAN/USD','ZW=F': 'WHEAT/USD',
  'KC=F': 'COFFEE/USD', 'SB=F': 'SUGAR/USD',  'CT=F': 'COTTON/USD', 'CC=F': 'COCOA/USD',
  'ILS=X': 'USD/ILS',   'DX-Y.NYB': 'DXY',
  '^VIX':  'VIX',       '^OVX': 'OVX',
};

async function fetchTwelveData(yahooSymbol: string): Promise<PriceData | null> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return null;
  const symbol = TWELVE_DATA_MAP[yahooSymbol];
  if (!symbol) return null;
  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const d: {
      close?: string; previous_close?: string; change?: string; percent_change?: string;
      high?: string; low?: string; fifty_two_week?: { high?: string; low?: string };
      status?: string;
    } = await res.json();
    if (d.status === 'error' || !d.close) return null;
    const price = parseFloat(d.close);
    const prevClose = parseFloat(d.previous_close ?? d.close);
    if (!price) return null;
    return {
      price,
      change: parseFloat(d.change ?? '0'),
      changePercent: parseFloat(d.percent_change ?? '0'),
      dayHigh: d.high ? parseFloat(d.high) : undefined,
      dayLow:  d.low  ? parseFloat(d.low)  : undefined,
      weekHigh52: d.fifty_two_week?.high ? parseFloat(d.fifty_two_week.high) : undefined,
      weekLow52:  d.fifty_two_week?.low  ? parseFloat(d.fifty_two_week.low)  : undefined,
    };
    void prevClose;
  } catch { return null; }
}

async function fetchSingleQuote(symbol: string): Promise<PriceData | null> {
  const q1 = await fetchFromYahoo(symbol, 'query1.finance.yahoo.com');
  if (q1) return q1;
  const q2 = await fetchFromYahoo(symbol, 'query2.finance.yahoo.com');
  if (q2) return q2;
  const finnhub = await fetchFinnhub(symbol);
  if (finnhub) return finnhub;
  return fetchTwelveData(symbol);
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
        symbol: ticker.symbol, name: ticker.name, category: ticker.category,
        price: 0, change: 0, changePercent: 0, unit: ticker.unit, source: 'yahoo', error: 'No data',
      };
    }
    return {
      symbol: ticker.symbol, name: ticker.name, category: ticker.category,
      price: data.price, change: data.change, changePercent: data.changePercent,
      unit: ticker.unit, source: 'yahoo',
      dayHigh: data.dayHigh, dayLow: data.dayLow,
      weekHigh52: data.weekHigh52, weekLow52: data.weekLow52,
    };
  });
}

// ── Historical data ───────────────────────────────────────────────────────────

type Period = '1mo' | '3mo' | '6mo' | '1y' | '2y' | 'custom';

function getPeriodStart(period: Period, customStart?: string): Date {
  const now = new Date();
  const d = new Date(now);
  if (period === '1mo')  { d.setMonth(d.getMonth() - 1);      return d; }
  if (period === '3mo')  { d.setMonth(d.getMonth() - 3);      return d; }
  if (period === '6mo')  { d.setMonth(d.getMonth() - 6);      return d; }
  if (period === '1y')   { d.setFullYear(d.getFullYear() - 1); return d; }
  if (period === '2y')   { d.setFullYear(d.getFullYear() - 2); return d; }
  if (period === 'custom' && customStart) return new Date(customStart);
  d.setMonth(d.getMonth() - 3);
  return d;
}

export async function fetchHistory(
  symbol: string,
  period: Period = '3mo',
  customStart?: string
): Promise<HistoricalPoint[]> {
  const start = getPeriodStart(period, customStart);
  const period1 = Math.floor(start.getTime() / 1000);
  const period2 = Math.floor(Date.now() / 1000);
  const path = `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${period1}&period2=${period2}`;

  let res = await fetch(`https://query1.finance.yahoo.com${path}`, { headers: HEADERS });
  if (!res.ok) res = await fetch(`https://query2.finance.yahoo.com${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Yahoo chart ${symbol}: ${res.status}`);

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
