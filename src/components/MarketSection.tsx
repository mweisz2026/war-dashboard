'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Quote } from '@/lib/types';
import TickerCard from './TickerCard';

interface Props {
  label: string;
  description: string;
  quotes: Quote[];
  onTickerClick: (quote: Quote) => void;
  selectedSymbol?: string;
}

export default function MarketSection({ label, description, quotes, onTickerClick, selectedSymbol }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (quotes.length === 0) return null;

  return (
    <section className="mb-5">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2 mb-2 group"
      >
        <span className="text-muted group-hover:text-text transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>
        <h2 className="text-sm font-semibold text-text uppercase tracking-wider">{label}</h2>
        <span className="text-xs text-muted/60 font-mono normal-case tracking-normal hidden sm:block">
          — {description}
        </span>
        <div className="flex-1 border-t border-border/40 ml-2" />
      </button>

      {/* Grid of cards */}
      {!collapsed && (
        <div className={clsx(
          'grid gap-2',
          quotes.length <= 2  ? 'grid-cols-2' :
          quotes.length <= 3  ? 'grid-cols-3' :
          quotes.length <= 4  ? 'grid-cols-4' :
          quotes.length <= 6  ? 'grid-cols-3 sm:grid-cols-6' :
          'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'
        )}>
          {quotes.map((q) => (
            <TickerCard
              key={q.symbol}
              quote={q}
              onClick={onTickerClick}
              isSelected={selectedSymbol === q.symbol}
            />
          ))}
        </div>
      )}
    </section>
  );
}
