'use client';

import { useState, useCallback, useRef } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Quote, NewsItem, MarketSnapshot } from '@/lib/types';
import { CATEGORIES } from '@/lib/tickers';
import MarketSection from './MarketSection';
import PriceChart from './PriceChart';
import NewsFeed from './NewsFeed';

// Key metrics shown in the top banner
const BANNER_SYMBOLS = ['CL=F', 'GC=F', '^VIX', 'ILS=X', '^GSPC', 'BAMLH0A0HYM2'];

interface Props {
  initialSnapshot: MarketSnapshot;
  initialNews: NewsItem[];
}

function fmt(price: number, unit?: string) {
  if (price === 0) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function BannerCard({ quote }: { quote: Quote }) {
  const isUp = quote.changePercent > 0;
  const isDown = quote.changePercent < 0;
  return (
    <div className="flex flex-col items-center px-4 py-2 border-r border-border last:border-0 min-w-[110px]">
      <span className="text-[10px] text-muted font-mono uppercase tracking-wider">{quote.name}</span>
      <span className="text-base font-mono font-bold text-text mt-0.5">
        {fmt(quote.price, quote.unit)}
        {quote.unit && <span className="text-[9px] text-muted ml-0.5">{quote.unit}</span>}
      </span>
      <span className={clsx(
        'text-[11px] font-mono',
        isUp ? 'text-up' : isDown ? 'text-down' : 'text-muted'
      )}>
        {isUp ? '▲' : isDown ? '▼' : '—'}
        {Math.abs(quote.changePercent).toFixed(2)}%
      </span>
    </div>
  );
}

export default function Dashboard({ initialSnapshot, initialNews }: Props) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(initialSnapshot);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsPending(true);
    setRefreshError(false);
    try {
      const [marketRes, newsRes] = await Promise.all([
        fetch('/api/market', { signal: abortRef.current.signal }),
        fetch('/api/news',   { signal: abortRef.current.signal }),
      ]);
      if (!marketRes.ok || !newsRes.ok) throw new Error('Fetch failed');
      const [marketData, newsData] = await Promise.all([marketRes.json(), newsRes.json()]);
      setSnapshot(marketData);
      setNews(newsData.news ?? []);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setRefreshError(true);
    } finally {
      setIsPending(false);
    }
  }, []);

  const bannerQuotes = BANNER_SYMBOLS
    .map((s) => snapshot.quotes.find((q) => q.symbol === s))
    .filter(Boolean) as Quote[];

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-lg font-bold font-mono text-text tracking-tight">
                🌐 War Impact Tracker
              </h1>
              <p className="text-[11px] text-muted font-mono">
                Iran · Israel · US — Real-time market & macro impact dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              {refreshError && (
                <span className="flex items-center gap-1 text-xs text-down font-mono">
                  <AlertCircle size={12} /> Refresh failed
                </span>
              )}
              <span className="text-[10px] text-muted font-mono hidden sm:block">
                Updated {new Date(snapshot.timestamp).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <button
                onClick={refresh}
                disabled={isPending}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono',
                  'border border-border hover:border-accent/60 hover:text-accent transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RefreshCw size={12} className={clsx(isPending && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Key metrics banner ──────────────────────────────────── */}
      <div className="border-b border-border bg-bg/80">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex overflow-x-auto">
            {bannerQuotes.map((q) => <BannerCard key={q.symbol} quote={q} />)}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Market sections */}
          <main className="flex-1 min-w-0">
            {CATEGORIES.map(({ key, label, description }) => {
              const quotes = snapshot.quotes.filter((q) => q.category === key);
              return (
                <MarketSection
                  key={key}
                  label={label}
                  description={description}
                  quotes={quotes}
                  onTickerClick={setSelectedQuote}
                  selectedSymbol={selectedQuote?.symbol}
                />
              );
            })}
          </main>

          {/* News sidebar */}
          <aside className="lg:w-80 xl:w-96 lg:sticky lg:top-[112px] lg:h-[calc(100vh-120px)]">
            <NewsFeed items={news} lastUpdated={snapshot.timestamp} />
          </aside>
        </div>
      </div>

      {/* ── Chart modal ─────────────────────────────────────────── */}
      {selectedQuote && (
        <PriceChart
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
}
