'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { Quote, HistoricalPoint } from '@/lib/types';
import { CONFLICT_DATES, DEFAULT_BASELINE_DATE } from '@/lib/tickers';

const PERIODS = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
  { label: 'Since Apr 2024', value: 'custom' },
] as const;

interface Props {
  quote: Quote;
  onClose: () => void;
}

interface TooltipPayload {
  payload: { date: string; close: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { date: string; close: number };
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs font-mono shadow-xl">
      <div className="text-muted">{format(parseISO(d.date), 'MMM d, yyyy')}</div>
      <div className="text-text font-semibold text-sm">{d.close.toLocaleString('en-US', { maximumFractionDigits: 3 })}</div>
    </div>
  );
}

export default function PriceChart({ quote, onClose }: Props) {
  const [period, setPeriod] = useState<string>('3mo');
  const [data, setData] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ symbol: quote.symbol, period });
        if (period === 'custom') {
          params.set('period', 'custom');
          params.set('start', DEFAULT_BASELINE_DATE);
        }
        const res = await fetch(`/api/history?${params}`);
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json.data ?? []);
      } catch (e) {
        setError('Could not load chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quote.symbol, period]);

  const isUp = (quote.changePercent ?? 0) >= 0;
  const lineColor = isUp ? '#3fb950' : '#f85149';

  // Baseline price (first data point) for % change from baseline
  const baseline = data[0]?.close ?? null;
  const latest = data[data.length - 1]?.close ?? null;
  const totalChange = baseline && latest ? ((latest - baseline) / baseline) * 100 : null;

  // Conflict date reference lines that fall within the data range
  const refLines = data.length
    ? CONFLICT_DATES.filter((d) => {
        const dt = d.date;
        return dt >= data[0].date && dt <= data[data.length - 1].date;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-surface border border-border rounded-xl shadow-2xl p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-mono font-bold text-text">{quote.name}</h2>
              <span className="text-xs text-muted font-mono bg-bg px-2 py-0.5 rounded">{quote.symbol}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-mono font-semibold text-text">
                {quote.price.toLocaleString('en-US', { maximumFractionDigits: 3 })}
                {quote.unit && <span className="text-sm text-muted ml-1">{quote.unit}</span>}
              </span>
              <span className={clsx(
                'text-sm font-mono font-semibold',
                isUp ? 'text-up' : 'text-down'
              )}>
                {isUp ? '▲' : '▼'} {Math.abs(quote.changePercent).toFixed(2)}% today
              </span>
              {totalChange !== null && (
                <span className={clsx(
                  'text-xs font-mono px-2 py-0.5 rounded',
                  totalChange >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
                )}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)}% this period
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 mb-4">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                'px-3 py-1 text-xs font-mono rounded transition-colors',
                period === p.value
                  ? 'bg-accent text-white'
                  : 'bg-bg text-muted hover:text-text border border-border'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64">
          {loading && (
            <div className="h-full flex items-center justify-center text-muted text-sm font-mono">
              Loading...
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center text-down text-sm font-mono">
              {error}
            </div>
          )}
          {!loading && !error && data.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(v) => {
                    try { return format(parseISO(v), 'MMM d'); } catch { return v; }
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'monospace' }}
                  domain={['auto', 'auto']}
                  width={55}
                  tickFormatter={(v) => v.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                />
                <Tooltip content={<CustomTooltip />} />
                {refLines.map((rl) => (
                  <ReferenceLine
                    key={rl.date}
                    x={rl.date}
                    stroke="#d29922"
                    strokeDasharray="4 3"
                    label={{
                      value: rl.label,
                      position: 'insideTopLeft',
                      fill: '#d29922',
                      fontSize: 9,
                      fontFamily: 'monospace',
                    }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  dot={false}
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conflict date legend */}
        {refLines.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {refLines.map((rl) => (
              <span key={rl.date} className="text-[10px] font-mono text-warn/80">
                ── {rl.date}: {rl.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
