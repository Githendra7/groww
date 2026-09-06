'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMarketStore } from '@/store/useMarketStore';

export function LiveMarketProvider({ children }: { children: React.ReactNode }) {
    const updatePrice = useMarketStore((state) => state.updatePrice);

    useEffect(() => {
        console.log("🔌 Connecting to Supabase Realtime...");

        const channel = supabase.channel('market-data')
            .on(
                'broadcast',
                { event: 'prices-update' },
                (payload) => {
                    // ADDED THIS LOG TO DEBUG
                    console.log("📥 Received broadcast data:", payload.payload);

                    const stocks = payload.payload;
                    stocks.forEach((stock: any) => {
                        updatePrice(stock.symbol, {
                            price: stock.price,
                            change: stock.change || 0, // Fallback for weekends when change might be null
                            updatedAt: stock.updatedAt,
                        });
                    });
                }
            )
            .subscribe((status) => {
                console.log("📡 Subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [updatePrice]);

    return <>{children}</>;
}