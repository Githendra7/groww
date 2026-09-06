'use client';
import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { StockChart } from './StockChart';

export function WatchlistTable({
    userWatchlist,
    allStocks,
    initialPrices = {}
}: {
    userWatchlist: any[],
    allStocks: any[],
    initialPrices?: Record<string, any>
}) {
    const livePrices = useMarketStore((state) => state.livePrices);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<any | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const watchedSymbols = userWatchlist.map((s) => s.symbol);
    const availableToAdd = allStocks.filter((s) => !watchedSymbols.includes(s.symbol));

    const addStock = async (symbol: string) => {
        setLoading(symbol);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_watchlists').insert({ user_id: user.id, symbol });
            router.refresh();
        }
        setLoading(null);
    };

    const removeStock = async (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation(); // Prevents row click (modal open) when clicking the trash can!
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_watchlists').delete().eq('user_id', user.id).eq('symbol', symbol);
            router.refresh();
        }
    };

    // Helper for the chart modal
    const selectedLiveData = selectedStock ? (livePrices[selectedStock.symbol] || initialPrices[selectedStock.symbol]) : null;
    const safeChange = selectedLiveData?.change || 0; // Safe fallback if undefined
    const selectedIsPositive = safeChange >= 0;

    return (
        <div className="space-y-4">

            {/* 1. Header & Add Stocks Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Tracking {userWatchlist.length} Stocks
                </h2>

                <div className="flex items-center">
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Stocks
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add to your Watchlist</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 mt-4">
                                {availableToAdd.length === 0 && <p className="text-sm text-slate-500">You are tracking all available stocks!</p>}
                                {availableToAdd.map((stock) => (
                                    <div key={stock.symbol} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                                        <div>
                                            <p className="font-semibold">{stock.company_name}</p>
                                            <p className="text-xs text-slate-500">{stock.symbol.replace('.NS', '')}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => addStock(stock.symbol)} disabled={loading === stock.symbol}>
                                            {loading === stock.symbol ? "Adding..." : "Add"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* 2. Main Watchlist Table */}
            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead className="text-right">Mkt Price</TableHead>
                            <TableHead className="text-right">1D Change</TableHead>
                            <TableHead className="text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userWatchlist.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Your watchlist is empty.</TableCell></TableRow>
                        )}

                        {userWatchlist.map((stock) => {
                            const liveData = livePrices[stock.symbol] || initialPrices[stock.symbol];
                            const price = liveData?.price;
                            const change = liveData?.change || 0;
                            const isPositive = change >= 0;

                            return (
                                // Added cursor-pointer to indicate it's clickable
                                <TableRow
                                    key={stock.symbol}
                                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                                    onClick={() => setSelectedStock(stock)}
                                >
                                    <TableCell>
                                        <div className="font-medium">{stock.company_name}</div>
                                        <div className="text-xs text-muted-foreground">{stock.symbol.replace('.NS', '')}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {price ? `₹${price.toFixed(2)}` : '---'}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right w-[50px]">
                                        {/* The onClick here has e.stopPropagation() so it deletes instead of opening the chart */}
                                        <button
                                            onClick={(e) => removeStock(e, stock.symbol)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
                                            title="Remove from Watchlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* 3. The Chart Modal */}
            <Dialog open={!!selectedStock} onOpenChange={(open) => !open && setSelectedStock(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    {selectedStock && selectedLiveData && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedStock.company_name}</h2>
                                        <p className="text-sm text-slate-500 font-normal">{selectedStock.symbol.replace('.NS', '')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">₹{selectedLiveData.price.toFixed(2)}</p>
                                        <p className={`text-sm font-medium ${selectedIsPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {selectedIsPositive ? '▲' : '▼'} {Math.abs(safeChange).toFixed(2)}%
                                        </p>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            {/* Render the Recharts component */}
                            <StockChart symbol={selectedStock.symbol} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}