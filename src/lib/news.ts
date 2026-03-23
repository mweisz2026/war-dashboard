import Parser from 'rss-parser';
import type { NewsItem } from './types';

const parser = new Parser({ timeout: 8000 });

const FEEDS = [
  { url: 'https://www.timesofisrael.com/feed/',           source: 'Times of Israel' },
  { url: 'https://www.haaretz.com/arc/outboundfeeds/rss/?outputType=xml', source: 'Haaretz' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',     source: 'Al Jazeera' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',   source: 'BBC World' },
  { url: 'https://rss.ap.org/article/world-news',         source: 'AP' },
];

// Keywords to filter for conflict-relevant stories
const KEYWORDS = [
  'iran', 'israel', 'middle east', 'hezbollah', 'hamas', 'gaza',
  'tehran', 'netanyahu', 'idf', 'irgc', 'oil', 'crude', 'strait of hormuz',
  'sanctions', 'missile', 'strike', 'attack', 'war', 'conflict',
  'persian gulf', 'red sea', 'houthi', 'nuclear', 'uranium', 'ceasefire',
  'pentagon', 'centcom', 'us military',
];

function isRelevant(title: string, summary?: string): boolean {
  const text = `${title} ${summary ?? ''}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw));
}

export async function fetchNews(limit = 40): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return feed.items.map((item): NewsItem => ({
        title: item.title ?? '',
        url: item.link ?? item.guid ?? '#',
        source,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        summary: item.contentSnippet ?? item.content ?? '',
      }));
    })
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  // Filter for relevance, deduplicate by title, sort newest first
  const seen = new Set<string>();
  const filtered = all
    .filter((item) => {
      if (seen.has(item.title)) return false;
      if (!isRelevant(item.title, item.summary)) return false;
      seen.add(item.title);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return filtered.slice(0, limit);
}
