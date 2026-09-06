export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get ONLY the symbols this specific user is watching
    const { data: watchData } = await supabase
        .from('user_watchlists')
        .select('symbol')
        .eq('user_id', user.id);

    const watchedSymbols = watchData?.map(w => w.symbol) || [];

    if (watchedSymbols.length === 0) {
        return NextResponse.json({ lastReviewedAt: new Date().toISOString(), historicalPrices: {} });
    }

    // 2. Look up THEIR specific last_reviewed_at time
    const { data: session } = await supabase.from('user_sessions').select('last_reviewed_at').eq('user_id', user.id).single();
    const lastReviewedAt = session?.last_reviewed_at || new Date(Date.now() - 30 * 60000).toISOString();

    // 3. Fetch snapshots ONLY for their watched symbols
    const { data: snapshots, error } = await supabase
        .from('price_snapshots')
        .select('symbol, price')
        .gte('timestamp', lastReviewedAt)
        .in('symbol', watchedSymbols) // <-- Optimization: Filter by user's stocks
        .order('timestamp', { ascending: true });

    const historicalPrices: Record<string, number> = {};
    snapshots?.forEach(snap => {
        if (!historicalPrices[snap.symbol]) historicalPrices[snap.symbol] = snap.price;
    });

    return NextResponse.json({ lastReviewedAt, historicalPrices });
}