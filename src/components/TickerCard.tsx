'use client';

import clsx from 'clsx';
import type { Quote } from '@/lib/types';

interface Props {
  quote: Quote;
  onClick: (quote: Quote) => void;
  isSelected: boolean;
}

function fmt(n: number, unit?: string): string {
  if (n === 0) return '—';
  if (unit === '%' || unit === 'bps') {
    return n.toFixed(unit === 'bps' ? 0 : 2);
  }
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 100) return n.toFixed(2);
  return n.toFixed(3);
}

function fmtChange(n: number): string {
  if (n === 0) return '0.00';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}`;
}

function fmtPct(n: number): string {
  if (n === 0) return '0.00%';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export default function TickerCard({ quote, onClick, isSelected }: Props) {
  const isUp = quote.changePercent > 0;
  const isDown = quote.changePercent < 0;
  const hasError = !!quote.error || quote.price === 0;

  return (
    <button
      onClick={() => onClick(quote)}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all duration-150',
        'hover:border-accent/60 hover:bg-surface/80 focus:outline-none',
        isSelected
          ? 'border-accent bg-accent/10'
          : 'border-border bg-surface',
        hasError && 'opacity-40'
      )}
    >
      {/* Symbol + source badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-muted uppercase tracking-wider truncate max-w-[70%]">
          {quote.symbol}
        </span>
        {quote.source === 'fred' && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-warn/20 text-warn font-mono">FRED</span>
        )}
      </div>

      {/* Name */}
      <div className="text-[11px] text-text/70 mb-2 truncate">{quote.name}</div>

      {/* Price */}
      <div className="text-base font-mono font-semibold text-text">
        {hasError ? <span className="text-muted text-xs">N/A</span> : (
          <>
            {fmt(quote.price, quote.unit)}
            {quote.unit && <span className="text-[10px] text-muted ml-1">{quote.unit}</span>}
          </>
        )}
      </div>

      {/* Change row */}
      {!hasError && (
        <div className={clsx(
          'flex items-center gap-2 mt-1 text-xs font-mono',
          isUp ? 'text-up' : isDown ? 'text-down' : 'text-muted'
        )}>
          <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
          <span>{fmtChange(quote.change)}</span>
          <span className="font-semibold">{fmtPct(quote.changePercent)}</span>
        </div>
      )}
    </button>
  );
}
