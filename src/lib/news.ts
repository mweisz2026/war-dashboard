import Parser from 'rss-parser';
import type { NewsItem } from './types';

const parser = new Parser({ timeout: 8000 });

const FEEDS = [
  // ── Direct regional sources ────────────────────────────────────────────────
  { url: 'https://feeds.reuters.com/reuters/worldNews',                          source: 'Reuters' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',                       source: 'Reuters' },
  { url: 'https://www.timesofisrael.com/feed/',                                  source: 'Times of Israel' },
  { url: 'https://www.jpost.com/rss/rssfeedsFrontPage.aspx',                     source: 'Jerusalem Post' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                            source: 'Al Jazeera' },
  { url: 'https://www.haaretz.com/arc/outboundfeeds/rss/?outputType=xml',        source: 'Haaretz' },
  { url: 'https://breakingdefense.com/feed/',                                    source: 'Breaking Defense' },
  // ── Broad international ────────────────────────────────────────────────────
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                         source: 'BBC World' },
  { url: 'https://rss.ap.org/article/world-news',                                source: 'AP' },
  { url: 'https://api.axios.com/feed/',                                          source: 'Axios' },
  // ── Financial / markets ────────────────────────────────────────────────────
  { url: 'https://feeds.a.wsj.com/wsj/xml/rss/3_7085.xml',                      source: 'WSJ Markets' },
  { url: 'https://feeds.a.wsj.com/wsj/xml/rss/3_7011.xml',                      source: 'WSJ World' },
  { url: 'https://www.ft.com/rss/home',                                          source: 'FT' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss',                         source: 'Bloomberg' },
  { url: 'https://feeds.bloomberg.com/politics/news.rss',                        source: 'Bloomberg' },
  // ── Google News targeted searches — catches paywalled articles ─────────────
  // Google indexes WSJ, FT, Bloomberg, NYT etc. and surfaces them via RSS
  { url: 'https://news.google.com/rss/search?q=iran+israel+war+military&hl=en-US&gl=US&ceid=US:en',          source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=iran+oil+crude+sanctions+hormuz&hl=en-US&gl=US&ceid=US:en',   source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=houthi+red+sea+shipping+tanker&hl=en-US&gl=US&ceid=US:en',    source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=iran+gulf+states+nuclear+strikes&hl=en-US&gl=US&ceid=US:en',  source: 'Google News' },
];

// ── Relevance scoring ─────────────────────────────────────────────────────────
// A story is relevant if it scores above the threshold.
// This replaces the flat keyword list with weighted categories.

// Direct conflict participants & events — any one = highly relevant (10 pts)
const DIRECT_CONFLICT = [
  // Iran actors & places
  'iran', 'iranian', 'irgc', 'khamenei', 'pezeshkian', 'tehran', 'isfahan',
  'natanz', 'fordow', 'arak', 'bushehr',
  // Nuclear
  'uranium enrichment', 'nuclear deal', 'jcpoa', 'iran nuclear', 'breakout',
  'highly enriched uranium', 'centrifuge',
  // Iran military
  'iran sanctions', 'iran strikes', 'iran attack', 'iran offensive',
  'us strikes iran', 'israel strikes iran', 'iran retaliation',
  'centcom', 'fifth fleet',
  // Israel
  'idf', 'netanyahu', 'gallant', 'israel strikes', 'israeli air',
  'israeli military', 'mossad',
  // Proxies
  'hezbollah', 'nasrallah', 'houthi', 'houthis', 'ansar allah',
  'islamic revolutionary', 'quds force',
  // Key chokepoints
  'strait of hormuz', 'hormuz', 'bab el-mandeb',
  // Missile systems
  'iron dome', "david's sling", 'arrow missile',
  'ballistic missile', 'cruise missile attack', 'hypersonic missile',
  // Gulf states in conflict context
  'gulf states offense', 'gulf states defense', 'gcc military',
  'persian gulf blockade', 'gulf cooperation council military',
];

// Market & economic impact — moderate signal (5 pts)
const MARKET_IMPACT = [
  // Oil & energy
  'oil price', 'crude price', 'crude oil', 'brent crude', 'wti crude',
  'energy price', 'energy market', 'energy supply', 'energy crisis',
  'oil supply', 'oil output', 'oil disruption', 'opec', 'opec+',
  'natural gas price', 'gas supply', 'lng price', 'gas disruption',
  // Metals & commodities
  'gold price', 'gold rally', 'gold surge', 'safe haven',
  'copper price', 'commodity price', 'commodity market',
  // Defense
  'defense stock', 'defense spending', 'defense contract',
  'arms deal', 'arms contract', 'weapons contract', 'military spending',
  'lockheed', 'raytheon', 'northrop', 'general dynamics', 'bae systems',
  // Shipping & trade
  'shipping disruption', 'red sea shipping', 'suez canal',
  'tanker attack', 'cargo ship seized', 'freight rate', 'shipping rate',
  'war risk insurance', 'war risk premium',
  // Financial
  'geopolitical risk', 'risk premium', 'risk-off', 'flight to safety',
  'supply shock', 'inflation oil', 'stagflation',
  'oil futures', 'energy futures',
];

// Conflict context — geographic/political background (2 pts)
const CONFLICT_CONTEXT = [
  // Geography
  'middle east', 'persian gulf', 'arabian gulf', 'gulf states',
  'red sea', 'gulf of aden', 'gulf of oman',
  'gaza', 'west bank', 'golan heights', 'lebanon', 'syria',
  'iraq', 'yemen', 'saudi arabia', 'uae', 'bahrain',
  // US government
  'pentagon', 'white house', 'state department', 'national security council',
  'us military', 'us navy', 'us air force', 'us central command',
  // Military events
  'missile strike', 'air strike', 'airstrike', 'drone attack', 'drone strike',
  'rocket attack', 'precision strike', 'targeted strike',
  // Political
  'ceasefire', 'escalation', 'de-escalation', 'retaliation', 'war',
  'military operation', 'ground offensive', 'naval blockade',
  'sanctions', 'embargo', 'oil embargo', 'export ban',
  'proxy war', 'axis of resistance', 'resistance front',
  // Nuclear monitoring
  'iaea', 'nuclear inspectors', 'safeguards',
  // Non-state actors
  'hamas', 'islamic jihad', 'hezbollah attack', 'militia attack',
  // Offense/defense framing
  'offensive', 'preemptive strike', 'retaliatory strike', 'counter-strike',
];

// Noise exclusions — irrelevant articles that share keywords
const EXCLUSIONS = [
  'movie', 'film', 'actor', 'actress', 'celebrity', 'oscar',
  'nfl', 'nba', 'mlb', 'premier league', 'world cup',
  'recipe', 'fashion', 'lifestyle', 'travel guide',
  'iran deal 2015',        // stale JCPOA history
  'iran nuclear agreement 2015',
  'iranian cinema', 'iranian film', 'iranian tv',
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
