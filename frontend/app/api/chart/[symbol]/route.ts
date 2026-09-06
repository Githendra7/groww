import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
    try {
        const resolvedParams = await params;
        const symbol = resolvedParams.symbol;

        const queryOptions = {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            period2: new Date(),
            interval: '1d' as const
        };

        const result = await yahooFinance.chart(symbol, queryOptions);

        // Format for ApexCharts Candlestick: { x: Date, y: [Open, High, Low, Close] }
        const chartData = result.quotes
            .filter(quote => quote.close !== null && quote.open !== null)
            .map(quote => ({
                x: new Date(quote.date).getTime(), // ApexCharts requires timestamps for the X-axis
                y: [
                    Number(quote.open?.toFixed(2) || 0),
                    Number(quote.high?.toFixed(2) || 0),
                    Number(quote.low?.toFixed(2) || 0),
                    Number(quote.close?.toFixed(2) || 0)
                ]
            }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("Chart fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
    }
}