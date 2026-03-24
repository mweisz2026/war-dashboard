import Parser from 'rss-parser';
import type { NewsItem } from './types';

const parser = new Parser({ timeout: 8000 });

const FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/worldNews',                          source: 'Reuters' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',                       source: 'Reuters' },
  { url: 'https://www.timesofisrael.com/feed/',                                  source: 'Times of Israel' },
  { url: 'https://www.jpost.com/rss/rssfeedsFrontPage.aspx',                     source: 'Jerusalem Post' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                            source: 'Al Jazeera' },
  { url: 'https://breakingdefense.com/feed/',                                    source: 'Breaking Defense' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                         source: 'BBC World' },
  { url: 'https://api.axios.com/feed/',                                          source: 'Axios' },
  { url: 'https://feeds.a.wsj.com/wsj/xml/rss/3_7085.xml',                      source: 'WSJ Markets' },
  { url: 'https://feeds.a.wsj.com/wsj/xml/rss/3_7011.xml',                      source: 'WSJ World' },
  { url: 'https://www.ft.com/rss/home',                                          source: 'FT' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss',                         source: 'Bloomberg' },
  { url: 'https://feeds.bloomberg.com/politics/news.rss',                        source: 'Bloomberg' },
  { url: 'https://www.haaretz.com/arc/outboundfeeds/rss/?outputType=xml',        source: 'Haaretz' },
  { url: 'https://rss.ap.org/article/world-news',                                source: 'AP' },
];

// ── Relevance scoring ─────────────────────────────────────────────────────────
// A story is relevant if it scores above the threshold.
// This replaces the flat keyword list with weighted categories.

// Direct conflict participants & events — any one = highly relevant
const DIRECT_CONFLICT = [
  'iran', 'iranian', 'irgc', 'khamenei', 'tehran',
  'idf', 'netanyahu', 'israel strikes', 'israeli air', 'israeli military',
  'hezbollah', 'nasrallah',
  'houthi', 'houthis', 'ansar allah',
  'strait of hormuz', 'hormuz',
  'natanz', 'fordow', 'uranium enrichment', 'nuclear deal', 'jcpoa',
  'us strikes iran', 'iran sanctions', 'iran nuclear',
  'centcom', 'us military iran', 'us military israel',
  'iron dome', 'david\'s sling', 'arrow missile',
  'ballistic missile iran', 'cruise missile iran',
  'persian gulf blockade',
];

// Market & economic impact — relevant when they appear alongside conflict context
const MARKET_IMPACT = [
  'oil price', 'crude price', 'crude oil', 'brent crude', 'wti crude',
  'energy price', 'energy market', 'energy supply',
  'oil supply', 'oil output', 'opec',
  'natural gas price', 'gas supply disruption',
  'gold price', 'gold rally', 'safe haven',
  'defense stock', 'defense spending', 'arms contract', 'weapons contract',
  'shipping disruption', 'red sea shipping', 'suez canal',
  'tanker attack', 'cargo ship', 'freight rate',
  'war risk premium', 'geopolitical risk', 'risk premium',
  'inflation oil', 'supply shock',
  'lockheed', 'raytheon', 'northrop', 'general dynamics',
];

// Conflict context — geographic/political signals
const CONFLICT_CONTEXT = [
  'middle east', 'persian gulf', 'red sea', 'gulf of aden',
  'gaza', 'west bank', 'golan', 'lebanon', 'syria', 'iraq', 'yemen',
  'pentagon', 'white house iran', 'state department iran',
  'missile strike', 'air strike', 'drone attack', 'rocket attack',
  'ceasefire', 'escalation', 'retaliation', 'war',
  'military operation', 'ground offensive', 'naval blockade',
  'sanctions', 'embargo', 'oil embargo',
  'proxy war', 'axis of resistance',
  'iaea', 'nuclear inspectors',
  'hamas', 'islamic jihad', 'hezbollah attack',
];

// Noise exclusions — topics that share keywords but are irrelevant
const EXCLUSIONS = [
  'movie', 'film', 'actor', 'actress', 'celebrity', 'oscar',
  'sports', 'nfl', 'nba', 'soccer', 'football',
  'recipe', 'fashion', 'lifestyle',
  'iran deal 2015',   // old JCPOA history pieces, not current
];

function scoreRelevance(title: string, summary?: string): number {
  const text = `${title} ${summary ?? ''}`.toLowerCase();

  // Hard exclusions — skip immediately
  if (EXCLUSIONS.some((e) => text.includes(e))) return 0;

  let score = 0;

  // Direct conflict match = strong signal (10 pts each)
  for (const kw of DIRECT_CONFLICT) {
    if (text.includes(kw)) score += 10;
  }

  // Market impact match = moderate signal (5 pts each)
  for (const kw of MARKET_IMPACT) {
    if (text.includes(kw)) score += 5;
  }

  // Conflict context match = weak signal (2 pts each)
  for (const kw of CONFLICT_CONTEXT) {
    if (text.includes(kw)) score += 2;
  }

  // Require minimum meaningful signal:
  // - Direct conflict keyword alone is enough (score >= 10)
  // - Market impact needs conflict context to qualify (score >= 7, meaning at least 1 market + 1 context)
  // - Pure context words alone are not enough (score < 7 from only 2-pt words)
  return score;
}

// ── NewsAPI ───────────────────────────────────────────────────────────────────

interface NewsAPIArticle {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  description?: string;
}

interface NewsAPIResponse {
  status: string;
  articles?: NewsAPIArticle[];
}

async function fetchFromNewsAPI(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  // Two targeted queries — war/conflict + commodity/market impact
  const queries = [
    'iran AND (israel OR houthi OR hormuz OR strike OR nuclear OR sanctions)',
    'iran AND (oil OR crude OR commodity OR tanker OR shipping OR gold)',
  ];

  const results = await Promise.allSettled(
    queries.map(q =>
      fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&pageSize=50`,
        { headers: { 'X-Api-Key': apiKey } }
      ).then(r => r.json() as Promise<NewsAPIResponse>)
    )
  );

  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled' || r.value.status !== 'ok') continue;
    for (const a of r.value.articles ?? []) {
      if (!a.title || a.title === '[Removed]') continue;
      items.push({
        title: a.title,
        url: a.url,
        source: a.source.name,
        publishedAt: a.publishedAt,
        summary: a.description ?? '',
      });
    }
  }
  return items;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchNews(limit = 60): Promise<NewsItem[]> {
  const [rssResults, newsApiItems] = await Promise.all([
    Promise.allSettled(
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
    ),
    fetchFromNewsAPI(),
  ]);

  const all: NewsItem[] = [...newsApiItems];
  for (const r of rssResults) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  // Score, deduplicate by title, sort newest first
  const seen = new Set<string>();
  const filtered = all
    .filter((item) => {
      if (!item.title) return false;
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      if (scoreRelevance(item.title, item.summary) < 7) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return filtered.slice(0, limit);
}
