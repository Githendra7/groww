import { create } from 'zustand';

interface StockData {
    price: number;
    change: number;
    updatedAt: number;
}

interface MarketState {
    livePrices: Record<string, StockData>;
    lastUpdateReceivedAt: number | null;
    updatePrice: (symbol: string, data: StockData) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
    livePrices: {},
    lastUpdateReceivedAt: null,
    updatePrice: (symbol, data) =>
        set((state) => ({
            livePrices: {
                ...state.livePrices,
                [symbol]: data,
            },
            lastUpdateReceivedAt: Date.now(),
        })),
}));