import { createClient } from '@supabase/supabase-js';
import YahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';

dotenv.config();

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] }); // This hides the survey warning!
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const BROADCAST_INTERVAL = 10000;
const SNAPSHOT_INTERVAL = 15 * 60 * 1000;

// 🔥 FIX: Create one permanent channel connection
const channel = supabase.channel('market-data');
channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
        console.log("✅ Worker securely connected to Supabase Realtime!");
    }
});

async function getSymbols(): Promise<string[]> {
    const { data, error } = await supabase.from('stocks_metadata').select('symbol');
    return data ? data.map(row => row.symbol) : [];
}

async function fetchAndBroadcast(symbols: string[]) {
    try {
        const quotes = await yahooFinance.quote(symbols);
        const payload = quotes.map(q => ({
            symbol: q.symbol,
            //price: q.regularMarketPrice, // <--- We will change this line!
            price: q.regularMarketPrice * (1 + (Math.random() * 0.02 - 0.01)),
            change: q.regularMarketChangePercent,
            volume: q.regularMarketVolume,
            updatedAt: Date.now()
        }));

        // 🔥 FIX: Send using the permanent channel
        await channel.send({
            type: 'broadcast',
            event: 'prices-update',
            payload: payload,
        });

        console.log(`📡 [${new Date().toLocaleTimeString()}] Broadcasted live prices for ${payload.length} stocks`);
        return payload;
    } catch (error) {
        console.error("❌ Error fetching or broadcasting:", error);
        return null;
    }
}

async function saveSnapshots(data: any[]) {
    const snapshots = data.map(d => ({
        symbol: d.symbol, price: d.price, volume: d.volume
    }));
    await supabase.from('price_snapshots').insert(snapshots);
    console.log(`💾 [${new Date().toLocaleTimeString()}] Saved historical snapshots to database`);
}

async function main() {
    const symbols = await getSymbols();
    console.log(`🚀 Starting Market Engine for ${symbols.length} Indian Stocks...`);

    const initialData = await fetchAndBroadcast(symbols);
    if (initialData) await saveSnapshots(initialData);

    setInterval(() => fetchAndBroadcast(symbols), BROADCAST_INTERVAL);
    setInterval(async () => {
        const data = await fetchAndBroadcast(symbols);
        if (data) await saveSnapshots(data);
    }, SNAPSHOT_INTERVAL);
}

main();