'use client';

import { formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';
import { ExternalLink, Newspaper } from 'lucide-react';
import clsx from 'clsx';
import type { NewsItem } from '@/lib/types';

// Color per news source
const SOURCE_COLORS: Record<string, string> = {
  'Reuters':          'text-orange-400',
  'Times of Israel':  'text-blue-400',
  'Haaretz':          'text-cyan-400',
  'Jerusalem Post':   'text-sky-400',
  'Al Jazeera':       'text-yellow-400',
  'BBC World':        'text-red-400',
  'AP':               'text-purple-400',
  'Breaking Defense': 'text-rose-400',
  'Axios':            'text-indigo-400',
  'WSJ Markets':      'text-amber-300',
  'WSJ World':        'text-amber-300',
  'FT':               'text-pink-400',
  'Bloomberg':        'text-violet-400',
  'Google News':      'text-green-400',
  'NewsAPI':          'text-teal-400',
};

interface Props {
  items: NewsItem[];
  lastUpdated: string;
}

export default function NewsFeed({ items, lastUpdated }: Props) {
  const now = new Date();

  return (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Newspaper size={13} className="text-muted" />
        <h2 className="text-[11px] font-bold text-text uppercase tracking-widest">Headlines</h2>
        <span className="ml-auto text-[10px] text-muted font-mono">{items.length}</span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
        {items.length === 0 && (
          <div className="text-muted text-xs font-mono py-4 text-center">No headlines found</div>
        )}
        {items.map((item, i) => {
          let minutesAgo = 9999;
          try { minutesAgo = differenceInMinutes(now, parseISO(item.publishedAt)); } catch { /* noop */ }
          const isBreaking = minutesAgo < 30;
          const isFresh    = minutesAgo < 120;

          return (
            <article
              key={`${item.source}-${i}`}
              className={clsx(
                'group p-2 rounded-lg border transition-all',
                isBreaking
                  ? 'border-down/30 bg-down/5 hover:bg-down/8'
                  : 'border-transparent hover:border-border/60 hover:bg-surface/50'
              )}
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                {/* Source + time row */}
                <div className="flex items-center justify-between mb-0.5 gap-1">
                  <span className={clsx(
                    'text-[9px] font-mono font-bold uppercase tracking-wider truncate',
                    SOURCE_COLORS[item.source] ?? 'text-muted'
                  )}>
                    {isBreaking && <span className="text-down mr-1">●</span>}
                    {item.source}
                  </span>
                  <span className={clsx(
                    'text-[9px] font-mono flex-shrink-0',
                    isFresh ? 'text-text/60' : 'text-muted/60'
                  )}>
                    {formatDistanceToNow(parseISO(item.publishedAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Headline */}
                <div className="flex items-start gap-1">
                  <p className={clsx(
                    'text-[11px] leading-snug flex-1 transition-colors',
                    isBreaking ? 'text-text font-medium' : 'text-text/85 group-hover:text-text'
                  )}>
                    {item.title}
                  </p>
                  <ExternalLink size={9} className="text-muted/40 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </article>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-border/60 text-[9px] text-muted/60 font-mono leading-relaxed">
        Reuters · AP · BBC · Al Jazeera · Haaretz · ToI · JPost
        · WSJ · FT · Bloomberg · Breaking Defense · Google News · NewsAPI
      </div>
    </aside>
  );
}
