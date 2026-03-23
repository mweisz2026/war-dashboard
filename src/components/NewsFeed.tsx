'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { ExternalLink, Newspaper } from 'lucide-react';
import clsx from 'clsx';
import type { NewsItem } from '@/lib/types';

const SOURCE_COLORS: Record<string, string> = {
  'Times of Israel': 'text-blue-400',
  'Haaretz':         'text-cyan-400',
  'Al Jazeera':      'text-yellow-400',
  'BBC World':       'text-red-400',
  'AP':              'text-purple-400',
};

interface Props {
  items: NewsItem[];
  lastUpdated: string;
}

export default function NewsFeed({ items, lastUpdated }: Props) {
  return (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Newspaper size={14} className="text-muted" />
        <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Live Headlines</h2>
        <span className="ml-auto text-[10px] text-muted font-mono">
          {items.length} stories
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {items.length === 0 && (
          <div className="text-muted text-xs font-mono py-4 text-center">No headlines found</div>
        )}
        {items.map((item, i) => (
          <article
            key={`${item.source}-${i}`}
            className="group p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-surface/60 transition-all"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {/* Source + time */}
              <div className="flex items-center justify-between mb-1">
                <span className={clsx(
                  'text-[10px] font-mono font-semibold uppercase tracking-wider',
                  SOURCE_COLORS[item.source] ?? 'text-muted'
                )}>
                  {item.source}
                </span>
                <span className="text-[10px] text-muted font-mono">
                  {formatDistanceToNow(parseISO(item.publishedAt), { addSuffix: true })}
                </span>
              </div>

              {/* Headline */}
              <div className="flex items-start gap-1.5">
                <p className="text-xs text-text/90 leading-relaxed group-hover:text-text transition-colors flex-1">
                  {item.title}
                </p>
                <ExternalLink size={10} className="text-muted/50 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Summary snippet */}
              {item.summary && (
                <p className="text-[10px] text-muted mt-1 line-clamp-2 leading-relaxed">
                  {item.summary.slice(0, 120)}{item.summary.length > 120 ? '…' : ''}
                </p>
              )}
            </a>
          </article>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted font-mono">
        Sources: Times of Israel · Al Jazeera · BBC · AP · Haaretz
      </div>
    </aside>
  );
}
