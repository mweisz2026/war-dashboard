'use client';

import clsx from 'clsx';
import type { Quote } from '@/lib/types';

interface Props {
  quote: Quote;
  onClick: (quote: Quote) => void;
  isSelected: boolean;
}

function fmtPrice(n: number): string {
  if (n === 0) return '—';
  if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1000)  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (n >= 100)   return n.toFixed(2);
  if (n >= 10)    return n.toFixed(3);
  return n.toFixed(4);
}

function fmtChange(n: number): string {
  const sign = n > 0 ? '+' : '';
  if (Math.abs(n) >= 100) return `${sign}${n.toFixed(1)}`;
  if (Math.abs(n) >= 1)   return `${sign}${n.toFixed(2)}`;
  return `${sign}${n.toFixed(4)}`;
}

export default function CommodityCard({ quote, onClick, isSelected }: Props) {
  const isUp    = quote.changePercent > 0;
  const isDown  = quote.changePercent < 0;
  const hasData = quote.price > 0;

  // 52-week range position (0–100%)
  const has52w = hasData && quote.weekHigh52 != null && quote.weekLow52 != null
    && quote.weekHigh52 > quote.weekLow52;
  const pct52w = has52w
    ? Math.max(0, Math.min(100, ((quote.price - quote.weekLow52!) / (quote.weekHigh52! - quote.weekLow52!)) * 100))
    : null;

  return (
    <button
      onClick={() => onClick(quote)}
      className={clsx(
        'w-full text-left rounded-xl border transition-all duration-150 p-3.5',
        'hover:scale-[1.01] hover:shadow-lg focus:outline-none',
        isSelected && 'ring-1 ring-accent',
        !hasData && 'opacity-40',
        isUp   && 'border-up/25 bg-gradient-to-br from-up/5 to-transparent',
        isDown && 'border-down/25 bg-gradient-to-br from-down/5 to-transparent',
        !isUp && !isDown && 'border-border bg-surface',
      )}
    >
      {/* Name + change badge */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-[11px] font-semibold text-text/80 leading-tight">{quote.name}</span>
        {hasData && (
          <span className={clsx(
            'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0',
            isUp   ? 'bg-up/15 text-up'   :
            isDown ? 'bg-down/15 text-down' :
                     'bg-border text-muted'
          )}>
            {isUp ? '▲' : isDown ? '▼' : '—'}{Math.abs(quote.changePercent).toFixed(2)}%
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        {hasData ? (
          <>
            <span className="text-xl font-mono font-bold text-text">{fmtPrice(quote.price)}</span>
            {quote.unit && <span className="text-[9px] text-muted font-mono">{quote.unit}</span>}
          </>
        ) : (
          <span className="text-sm text-muted font-mono">N/A</span>
        )}
      </div>

      {/* Change amount */}
      {hasData && (
        <div className={clsx(
          'text-[10px] font-mono mb-3',
          isUp ? 'text-up' : isDown ? 'text-down' : 'text-muted'
        )}>
          {fmtChange(quote.change)} today
        </div>
      )}

      {/* 52-Week Range Bar */}
      {pct52w !== null ? (
        <div>
          <div className="flex justify-between text-[8px] text-muted/60 font-mono mb-1">
            <span>{fmtPrice(quote.weekLow52!)}</span>
            <span className="text-muted/40">52W</span>
            <span>{fmtPrice(quote.weekHigh52!)}</span>
          </div>
          <div className="relative h-1 bg-border/60 rounded-full">
            {/* Filled bar */}
            <div
              className={clsx(
                'absolute inset-y-0 left-0 rounded-full opacity-50',
                isUp ? 'bg-up' : isDown ? 'bg-down' : 'bg-muted'
              )}
              style={{ width: `${pct52w}%` }}
            />
            {/* Marker dot */}
            <div
              className={clsx(
                'absolute top-1/2 w-2 h-2 rounded-full border border-bg shadow',
                isUp ? 'bg-up' : isDown ? 'bg-down' : 'bg-muted'
              )}
              style={{ left: `${pct52w}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>
      ) : (
        hasData && (
          <div className="h-1 bg-border/30 rounded-full" title="52W range unavailable" />
        )
      )}
    </button>
  );
}
