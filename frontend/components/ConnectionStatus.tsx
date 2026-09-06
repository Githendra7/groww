'use client';
import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function ConnectionStatus() {
    const lastUpdate = useMarketStore((state) => state.lastUpdateReceivedAt);
    const [status, setStatus] = useState<'live' | 'delayed'>('delayed');

    useEffect(() => {
        // Check every second if the last update was more than 15 seconds ago
        const interval = setInterval(() => {
            // If we haven't received an update yet, or it's been more than 15s -> Delayed
            if (!lastUpdate || Date.now() - lastUpdate > 15000) {
                setStatus('delayed');
            } else {
                setStatus('live');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdate]);

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            {status === 'live' ? (
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Market
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    Delayed / Reconnecting
                </span>
            )}
        </div>
    );
}