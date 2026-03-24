'use client';

import { useState, useCallback, useRef } from 'react';
import { RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Quote, NewsItem, MarketSnapshot } from '@/lib/types';
import { COMMODITY_CATEGORIES } from '@/lib/tickers';
import CommodityCard from './CommodityCard';
import PriceChart from './PriceChart';
import NewsFeed from './NewsFeed';

// Top banner: key war-sensitive signals
const BANNER_SYMBOLS = ['CL=F', 'BZ=F', 'GC=F', '^VIX', '^OVX', 'ILS=X', 'NG=F', 'HG=F'];

interface Props {
  initialSnapshot: MarketSnapshot;
  initialNews: NewsItem[];
}

function fmt(price: number) {
  if (!price) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 1 });
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function BannerTicker({ quote }: { quote: Quote }) {
  const isUp = quote.changePercent > 0;
  const isDown = quote.changePercent < 0;
  const abs = Math.abs(quote.changePercent);
  // Color intensifies with magnitude
  const pctColor = isUp
    ? abs >= 3 ? 'text-up font-bold' : 'text-up'
    : isDown
    ? abs >= 3 ? 'text-down font-bold' : 'text-down'
    : 'text-muted';
  return (
    <div className={clsx(
      'flex flex-col items-center px-3 py-2 border-r border-border/40 last:border-0 min-w-[100px] transition-colors',
      isUp && abs >= 2 && 'bg-up/5',
      isDown && abs >= 2 && 'bg-down/5',
    )}>
      <span className="text-[9px] text-muted/70 font-mono uppercase tracking-wider truncate w-full text-center">{quote.name}</span>
      <span className="text-sm font-mono font-bold text-text mt-0.5 tabular-nums">{fmt(quote.price)}</span>
      <span className={clsx('text-[10px] font-mono tabular-nums', pctColor)}>
        {isUp ? '▲' : isDown ? '▼' : '—'}{abs.toFixed(2)}%
      </span>
    </div>
  );
}

function CategorySection({
  label, description, quotes, onTickerClick, selectedSymbol, flashMap,
}: {
  label: string; description: string; quotes: Quote[];
  onTickerClick: (q: Quote) => void; selectedSymbol?: string;
  flashMap: Record<string, 'up' | 'down'>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (quotes.length === 0) return null;

  // Category-level summary: count of movers
  const up   = quotes.filter(q => q.changePercent > 0).length;
  const down = quotes.filter(q => q.changePercent < 0).length;

  return (
    <section className="mb-6">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        <span className="text-muted/70 group-hover:text-text transition-colors">
          {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </span>
        <h2 className="text-xs font-bold text-text uppercase tracking-widest">{label}</h2>
        <span className="text-[10px] text-muted/50 font-mono hidden sm:block normal-case tracking-normal">
          — {description}
        </span>
        <div className="flex-1 border-t border-border/30 ml-1" />
        {/* Up/down mover count */}
        <span className="text-[9px] font-mono text-up/70">{up}▲</span>
        <span className="text-[9px] font-mono text-down/70">{down}▼</span>
      </button>

      {!collapsed && (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {quotes.map(q => (
            <CommodityCard
              key={q.symbol}
              quote={q}
              onClick={onTickerClick}
              isSelected={selectedSymbol === q.symbol}
              flash={flashMap[q.symbol]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Dashboard({ initialSnapshot, initialNews }: Props) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(initialSnapshot);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  // Track which symbols changed price direction on last refresh for flash animation
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsPending(true);
    setRefreshError(false);
    try {
      const [mRes, nRes] = await Promise.all([
        fetch('/api/market', { signal: abortRef.current.signal }),
        fetch('/api/news',   { signal: abortRef.current.signal }),
      ]);
      if (!mRes.ok || !nRes.ok) throw new Error('Fetch failed');
      const [mData, nData] = await Promise.all([mRes.json(), nRes.json()]);
      // Compute which prices changed direction for flash effect
      setSnapshot(prev => {
        const prevMap = Object.fromEntries(prev.quotes.map(q => [q.symbol, q.price]));
        const newFlash: Record<string, 'up' | 'down'> = {};
        for (const q of (mData as MarketSnapshot).quotes) {
          const old = prevMap[q.symbol];
          if (old != null && q.price > 0 && old !== q.price) {
            newFlash[q.symbol] = q.price > old ? 'up' : 'down';
          }
        }
        setFlashMap(newFlash);
        setTimeout(() => setFlashMap({}), 900);
        return mData as MarketSnapshot;
      });
      setNews(nData.news ?? []);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setRefreshError(true);
    } finally {
      setIsPending(false);
    }
  }, []);

  const bannerQuotes = BANNER_SYMBOLS
    .map(s => snapshot.quotes.find(q => q.symbol === s))
    .filter(Boolean) as Quote[];

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold font-mono text-text tracking-tight">
                ⚔️ War Impact Commodity Tracker
              </h1>
              <p className="text-[10px] text-muted font-mono">Iran · Israel · US — Commodity & market impact</p>
            </div>
            {/* Live pulse indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-up/10 border border-up/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-up opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-up" />
              </span>
              <span className="text-[9px] font-mono text-up/80 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {refreshError && (
              <span className="flex items-center gap-1 text-[10px] text-down font-mono">
                <AlertCircle size={10} /> Refresh failed
              </span>
            )}
            <div className="hidden sm:block text-right">
              <div className="text-[10px] text-muted font-mono">
                {new Date(snapshot.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
              </div>
              <div className="text-[9px] text-muted/50 font-mono">Yahoo · FRED · Finnhub</div>
            </div>
            <button
              onClick={refresh}
              disabled={isPending}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-border hover:border-accent/60 hover:text-accent transition-all disabled:opacity-50"
            >
              <RefreshCw size={11} className={clsx(isPending && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>

        {/* Key signals banner */}
        <div className="border-t border-border/50 bg-bg/50">
          <div className="max-w-[1800px] mx-auto px-2">
            <div className="flex overflow-x-auto">
              {bannerQuotes.map(q => <BannerTicker key={q.symbol} quote={q} />)}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1800px] mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* Commodities — main content */}
          <main className="flex-1 min-w-0">
            {COMMODITY_CATEGORIES.map(({ key, label, description }) => (
              <CategorySection
                key={key}
                label={label}
                description={description}
                quotes={snapshot.quotes.filter(q => q.category === key)}
                onTickerClick={setSelectedQuote}
                selectedSymbol={selectedQuote?.symbol}
                flashMap={flashMap}
              />
            ))}
          </main>

          {/* News sidebar — narrower */}
          <aside className="w-60 xl:w-64 flex-shrink-0 lg:sticky lg:top-[96px] lg:h-[calc(100vh-104px)]">
            <NewsFeed items={news} lastUpdated={snapshot.timestamp} />
          </aside>
        </div>
      </div>

      {/* Chart modal */}
      {selectedQuote && (
        <PriceChart quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
      )}
    </div>
  );
}
