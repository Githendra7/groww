import { createClient } from '@/utils/supabase/server';
import { WatchlistTable } from '@/components/WatchListTable';
import { MeaningfulSidebar } from '@/components/MeaningfulSidebar';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import YahooFinance from 'yahoo-finance2'; // Ensure this uses curly brackets!
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';

export const revalidate = 0;
const yahooFinance = new YahooFinance();

export default async function Home() {
  const supabase = await createClient();

  // 1. Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 2. Fetch ALL 50 stocks (we need this to populate the "Add Stocks" dropdown)
  const { data: allStocks } = await supabase
    .from('stocks_metadata')
    .select('*')
    .order('company_name');

  // 3. Fetch ONLY the stocks the current user has in their watchlist
  const { data: userWatchlistData } = await supabase
    .from('user_watchlists')
    .select('symbol, stocks_metadata(*)')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true });

  // Clean up the nested data structure from Supabase
  const userWatchlist = userWatchlistData?.map(item => item.stocks_metadata) || [];

  // 4. Fetch SSR Prices ONLY for the stocks they are watching (Faster Page Load!)
  let initialPrices: Record<string, any> = {};
  try {
    const symbols = userWatchlist.map((s: any) => s.symbol);
    if (symbols.length > 0) {
      const quotes = (await yahooFinance.quote(symbols)) as any[];
      quotes.forEach((q) => {
        initialPrices[q.symbol] = {
          price: q.regularMarketPrice,
          change: q.regularMarketChangePercent,
        };
      });
    }
  } catch (err) {
    console.error("Server-side price fetch failed:", err);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Side: Main Dashboard */}
        <div className="flex-1">

          {/* UPDATED HEADER: Groups the Title, Status, and Logout together */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>

            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              <ConnectionStatus />
              <div className="w-px h-4 bg-slate-200"></div> {/* Tiny vertical divider */}
              <LogoutButton />
            </div>
          </div>

          {/* The Data Table */}
          <WatchlistTable
            userWatchlist={userWatchlist}
            allStocks={allStocks || []}
            initialPrices={initialPrices}
          />
        </div>

        {/* Right Side: Meaningful Change Context Engine */}
        <div className="w-full lg:w-[400px]">
          <MeaningfulSidebar />
        </div>

      </div>
    </main>
  );
}