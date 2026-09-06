'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid Next.js SSR 'window is not defined' errors
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function StockChart({ symbol }: { symbol: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/chart/${symbol}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setData(data);
                setLoading(false);
            });
    }, [symbol]);

    if (loading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-slate-400">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
            </div>
        );
    }

    if (data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400">No chart data available</div>;

    // ApexCharts Configuration Options
    const options: any = {
        chart: {
            type: 'candlestick',
            toolbar: { show: false }, // Hides the download/zoom menu for a cleaner UI
            background: 'transparent',
            animations: { enabled: false } // Faster rendering
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#10b981',   // Emerald Green for bullish days
                    downward: '#ef4444'  // Red for bearish days
                },
                wick: { useDataColors: true }
            }
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#94a3b8' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false }
        },
        yaxis: {
            labels: {
                formatter: (value: number) => `₹${value.toFixed(0)}`,
                style: { colors: '#94a3b8', fontWeight: 500 }
            },
            tooltip: { enabled: true }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'light',
            y: { formatter: (value: number) => `₹${value.toFixed(2)}` }
        }
    };

    return (
        <div className="h-[300px] w-full mt-4">
            <ApexChart
                options={options}
                series={[{ name: 'Stock Price', data: data }]}
                type="candlestick"
                height="100%"
            />
        </div>
    );
}