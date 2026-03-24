export type Category =
  | 'Crude Oil'
  | 'Refined Products'
  | 'Natural Gas'
  | 'Base Metals'
  | 'Precious Metals'
  | 'Specialty Metals'
  | 'Grains'
  | 'Softs'
  | 'Livestock'
  | 'Fertilizers'
  | 'Shipping'
  | 'Macro';

export interface TickerConfig {
  symbol: string;
  name: string;
  category: Category;
  unit?: string;
  source: 'yahoo' | 'fred';
}

export interface Quote {
  symbol: string;
  name: string;
  category: Category;
  price: number;
  change: number;
  changePercent: number;
  unit?: string;
  source: 'yahoo' | 'fred';
  dayHigh?: number;
  dayLow?: number;
  weekHigh52?: number;
  weekLow52?: number;
  error?: string;
}

export interface HistoricalPoint {
  date: string;
  close: number;
  volume?: number;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

export interface MarketSnapshot {
  quotes: Quote[];
  timestamp: string;
}
