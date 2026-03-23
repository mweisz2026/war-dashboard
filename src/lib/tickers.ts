import type { TickerConfig } from './types';

export const YAHOO_TICKERS: TickerConfig[] = [
  // ── Energy ────────────────────────────────────────────────────
  { symbol: 'CL=F',      name: 'WTI Crude Oil',     category: 'Energy',     unit: '$/bbl',    source: 'yahoo' },
  { symbol: 'BZ=F',      name: 'Brent Crude',        category: 'Energy',     unit: '$/bbl',    source: 'yahoo' },
  { symbol: 'NG=F',      name: 'Natural Gas',         category: 'Energy',     unit: '$/MMBtu',  source: 'yahoo' },
  { symbol: 'HO=F',      name: 'Heating Oil',         category: 'Energy',     unit: '$/gal',    source: 'yahoo' },

  // ── Metals (safe havens) ───────────────────────────────────────
  { symbol: 'GC=F',      name: 'Gold',                category: 'Metals',     unit: '$/oz',     source: 'yahoo' },
  { symbol: 'SI=F',      name: 'Silver',              category: 'Metals',     unit: '$/oz',     source: 'yahoo' },

  // ── Equity Indices ─────────────────────────────────────────────
  { symbol: '^GSPC',     name: 'S&P 500',             category: 'Equities',   unit: '',         source: 'yahoo' },
  { symbol: '^IXIC',     name: 'NASDAQ',              category: 'Equities',   unit: '',         source: 'yahoo' },
  { symbol: '^DJI',      name: 'Dow Jones',           category: 'Equities',   unit: '',         source: 'yahoo' },
  { symbol: 'EIS',       name: 'Israel ETF (EIS)',    category: 'Equities',   unit: '',         source: 'yahoo' },
  { symbol: '^TA125.TA', name: 'Tel Aviv 125',        category: 'Equities',   unit: '',         source: 'yahoo' },

  // ── Defense Stocks ─────────────────────────────────────────────
  { symbol: 'LMT',       name: 'Lockheed Martin',     category: 'Defense',    unit: '',         source: 'yahoo' },
  { symbol: 'RTX',       name: 'RTX Corp',            category: 'Defense',    unit: '',         source: 'yahoo' },
  { symbol: 'NOC',       name: 'Northrop Grumman',    category: 'Defense',    unit: '',         source: 'yahoo' },
  { symbol: 'GD',        name: 'General Dynamics',    category: 'Defense',    unit: '',         source: 'yahoo' },
  { symbol: 'BA',        name: 'Boeing',              category: 'Defense',    unit: '',         source: 'yahoo' },

  // ── FX ────────────────────────────────────────────────────────
  { symbol: 'ILS=X',     name: 'USD/ILS',             category: 'FX',         unit: '',         source: 'yahoo', inverseLabel: true },
  { symbol: 'EURUSD=X',  name: 'EUR/USD',             category: 'FX',         unit: '',         source: 'yahoo' },
  { symbol: 'DX-Y.NYB',  name: 'DXY (USD Index)',     category: 'FX',         unit: '',         source: 'yahoo' },
  { symbol: 'CADUSD=X',  name: 'CAD/USD',             category: 'FX',         unit: '',         source: 'yahoo' },

  // ── Volatility ────────────────────────────────────────────────
  { symbol: '^VIX',      name: 'VIX',                 category: 'Volatility', unit: '',         source: 'yahoo' },
  { symbol: '^OVX',      name: 'Oil VIX (OVX)',       category: 'Volatility', unit: '',         source: 'yahoo' },

  // ── Freight proxy ─────────────────────────────────────────────
  { symbol: 'BDRY',      name: 'Baltic Dry ETF (BDRY)', category: 'Freight',  unit: '',         source: 'yahoo' },
  { symbol: 'ZIM',       name: 'ZIM Shipping',        category: 'Freight',    unit: '',         source: 'yahoo' },
];

// FRED series — rates and credit spreads
export const FRED_SERIES: TickerConfig[] = [
  { symbol: 'DGS10',         name: '10Y Treasury',         category: 'Rates',  unit: '%', source: 'fred' },
  { symbol: 'DGS2',          name: '2Y Treasury',          category: 'Rates',  unit: '%', source: 'fred' },
  { symbol: 'DGS5',          name: '5Y Treasury',          category: 'Rates',  unit: '%', source: 'fred' },
  { symbol: 'T10YIE',        name: '10Y Breakeven (Infl)', category: 'Rates',  unit: '%', source: 'fred' },
  { symbol: 'BAMLH0A0HYM2',  name: 'HY OAS',               category: 'Credit', unit: 'bps', source: 'fred' },
  { symbol: 'BAMLC0A0CM',    name: 'IG OAS',               category: 'Credit', unit: 'bps', source: 'fred' },
];

export const ALL_TICKERS = [...YAHOO_TICKERS, ...FRED_SERIES];

export const CATEGORIES: Array<{
  key: string;
  label: string;
  description: string;
}> = [
  { key: 'Energy',     label: '⚡ Energy',            description: 'Oil & gas spot prices' },
  { key: 'Metals',     label: '🥇 Safe Havens',       description: 'Gold & silver' },
  { key: 'Equities',   label: '📈 Equity Indices',    description: 'Major stock indices + Israel ETF' },
  { key: 'Defense',    label: '🛡 Defense Stocks',    description: 'US defense contractors' },
  { key: 'FX',         label: '💱 FX & Dollar',       description: 'Currencies incl. USD/ILS' },
  { key: 'Rates',      label: '🏦 Rates',             description: 'US Treasury yields & breakevens' },
  { key: 'Credit',     label: '📉 Credit Spreads',    description: 'HY & IG option-adjusted spreads' },
  { key: 'Volatility', label: '〜 Volatility',        description: 'Equity & oil vol' },
  { key: 'Freight',    label: '🚢 Freight',           description: 'Shipping proxies' },
];

// Key conflict dates for chart annotations
export const CONFLICT_DATES = [
  { date: '2023-10-07', label: 'Hamas attack' },
  { date: '2024-04-01', label: 'IDF strikes Damascus consulate' },
  { date: '2024-04-13', label: 'Iran launches direct attack on Israel' },
  { date: '2024-04-19', label: 'Israel retaliates vs. Iran' },
  { date: '2025-06-13', label: 'US/Israel joint strikes on Iran' },
];

export const DEFAULT_BASELINE_DATE = '2024-04-13'; // Iran's first direct attack
