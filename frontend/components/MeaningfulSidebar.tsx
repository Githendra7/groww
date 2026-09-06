'use client';
import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function MeaningfulSidebar() {
    const livePrices = useMarketStore((state) => state.livePrices);
    const [history, setHistory] = useState<Record<string, number>>({});
    const [lastChecked, setLastChecked] = useState<string | null>(null);

    useEffect(() => {
        // Fetch historical data on mount
        fetch('/api/history')
            .then(res => res.json())
            .then(data => {
                setHistory(data.historicalPrices);
                setLastChecked(data.lastReviewedAt);
            });
    }, []);

    // The Engine Logic: Compare Live vs History
    const insights = [];

    for (const symbol in history) {
        const oldPrice = history[symbol];
        const livePrice = livePrices[symbol]?.price;

        if (oldPrice && livePrice) {
            const percentChange = ((livePrice - oldPrice) / oldPrice) * 100;

            // If the stock moved more than 0.5% since they last checked, flag it!
            // (Using 0.5% for hackathon demo so it triggers easily)
            if (Math.abs(percentChange) > 0.5) {
                insights.push({
                    symbol,
                    oldPrice,
                    livePrice,
                    percentChange,
                    isPositive: percentChange > 0
                });
            }
        }
    }

    const markAsReviewed = async () => {
        const now = new Date().toISOString();

        // We get the user first!
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Update their specific database row
            await supabase.from('user_sessions')
                .update({ last_reviewed_at: now })
                .eq('user_id', user.id);
        }

        const newBaseline: Record<string, number> = {};
        for (const symbol in livePrices) {
            if (livePrices[symbol]?.price) {
                newBaseline[symbol] = livePrices[symbol].price;
            }
        }

        setLastChecked(now);
        setHistory(newBaseline);
    };

    if (!lastChecked) return <div className="p-6">Loading insights...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8 flex flex-col h-[calc(100vh-4rem)]">
            <div className="mb-4">
                <h2 className="font-semibold text-lg">Since your last check</h2>
                <p className="text-xs text-slate-500">
                    Last checked: {new Date(lastChecked).toLocaleTimeString()}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {insights.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center mt-10">No significant movements yet. Market is quiet.</p>
                ) : (
                    insights.map((insight) => (
                        <div key={insight.symbol} className="border rounded-lg p-4 shadow-sm bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-sm">{insight.symbol.replace('.NS', '')}</div>
                                <div className={`text-xs px-2 py-1 rounded-full ${insight.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {insight.isPositive ? 'Positive' : 'Needs attention'}
                                </div>
                            </div>
                            <div className={`text-xl font-bold ${insight.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {insight.isPositive ? '↑' : '↓'} {Math.abs(insight.percentChange).toFixed(2)}%
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {insight.isPositive ? 'Spiked' : 'Dropped'} from ₹{insight.oldPrice.toFixed(2)} to ₹{insight.livePrice.toFixed(2)} since you left.
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="pt-4 mt-auto border-t">
                <Button onClick={markAsReviewed} className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Mark all as reviewed
                </Button>
            </div>
        </div>
    );
}