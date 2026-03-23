import { fetchAllQuotes } from '@/lib/yahoo';
import { fetchFredQuotes } from '@/lib/fred';
import { fetchNews } from '@/lib/news';
import Dashboard from '@/components/Dashboard';
import type { MarketSnapshot } from '@/lib/types';

// Always render dynamically — never pre-render at build time
// (avoids build-time outbound HTTP calls to Yahoo/FRED/RSS)
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all data server-side on first load (no loading spinner for users)
  const [yahooQuotes, fredQuotes, news] = await Promise.all([
    fetchAllQuotes().catch(() => []),
    fetchFredQuotes().catch(() => []),
    fetchNews(50).catch(() => []),
  ]);

  const snapshot: MarketSnapshot = {
    quotes: [...yahooQuotes, ...fredQuotes],
    timestamp: new Date().toISOString(),
  };

  return <Dashboard initialSnapshot={snapshot} initialNews={news} />;
}
