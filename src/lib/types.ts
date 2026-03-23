export type Category =
  | 'Energy'
  | 'Metals'
  | 'Equities'
  | 'Defense'
  | 'FX'
  | 'Rates'
  | 'Credit'
  | 'Volatility'
  | 'Freight';

export interface TickerConfig {
  symbol: string;
  name: string;
  category: Category;
  unit?: string;
  source: 'yahoo' | 'fred' | 'manual';
  /** If true, a rising value means the base currency weakened (e.g. USD/ILS) */
  inverseLabel?: boolean;
}

export interface Quote {
  symbol: string;
  name: string;
  category: Category;
  price: number;
  change: number;
  changePercent: number;
  unit?: string;
  source: 'yahoo' | 'fred' | 'manual';
  error?: string;
}

export interface HistoricalPoint {
  date: string; // ISO date string
  close: number;
  volume?: number;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO string
  summary?: string;
}

export interface MarketSnapshot {
  quotes: Quote[];
  timestamp: string;
}
