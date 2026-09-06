'use client';
import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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
    const [isOpen, setIsOpen] = useState(false);
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

    const removeStock = async (symbol: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_watchlists').delete().eq('user_id', user.id).eq('symbol', symbol);
            router.refresh();
        }
    };

    return (
        <div className="space-y-4">
            {/* Table Header & Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Tracking {userWatchlist.length} Stocks
                </h2>

                <div className="flex items-center">
                    {/* FIX 1: We removed DialogTrigger and used onClick directly to prevent nested buttons! */}
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setIsOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Stocks
                    </Button>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

            {/* The Data Table */}
            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead className="text-right">Mkt Price</TableHead>
                            <TableHead className="text-right">1D Change</TableHead>
                            {/* FIX 2: Removed the comment so it doesn't create whitespace in the <tr> */}
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
                                <TableRow key={stock.symbol} className="group">
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
                                        <button
                                            onClick={() => removeStock(stock.symbol)}
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
        </div>
    );
}