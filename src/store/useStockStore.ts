import { create } from 'zustand';
import axios from 'axios';
import { createStockUrl, deleteStockUrl, editStockUrl, getStockUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface Stock {
    id: number;
    item_id: number;
    quantity: number;
    note?: string | null;
    active_year_id: number;
    item_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FetchStockFilters {
    page?: number;
    limit?: number;
    id?: number;
    item_id?: number;
    active_year_id?: number;
    search?: string | null;
}

export interface CreateStockPayload {
    item_id: number;
    quantity: number;
    note?: string | null;
    active_year_id: number;
    action_by: string | number;
}

export interface EditStockPayload {
    id: number;
    item_id?: number;
    quantity?: number;
    note?: string | null;
    active_year_id: number;
    action_by: string | number;
}

export interface DeleteStockPayload {
    r_id: number;
    active_year_id: number;
    action_by: string | number;
}

interface StockState {
    // State
    stocks: Stock[];
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchStocks: (filters?: FetchStockFilters) => Promise<void>;
    createStock: (data: CreateStockPayload) => Promise<boolean>;
    editStock: (data: EditStockPayload) => Promise<boolean>;
    deleteStock: (data: DeleteStockPayload) => Promise<boolean>;
    clearError: () => void;
}
// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useStockStore = create<StockState>((set) => ({
    stocks: [],
    pagination: null,
    isLoading: false,
    error: null,

    // Fetch Paginated Stock Entries
    fetchStocks: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(getStockUrl, {
                page: filters.page ?? 1,
                limit: filters.limit ?? 10,
                ...filters,
            });

            const { stocks, pagination, data } = response.data;

            set({
                stocks: stocks || data || response.data || [],
                pagination: pagination || null,
                isLoading: false,
            });
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to fetch stock entries.';
            set({ error: errorMessage, isLoading: false });
        }
    },

    // Create Stock Entry
    createStock: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(createStockUrl, data);
            const newStock: Stock = response.data.message;

            set((state) => ({
                stocks: [newStock, ...state.stocks],
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to create stock entry.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Edit Stock Entry
    editStock: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(editStockUrl, data);
            const updatedStock: Stock =
                response.data.message?.data || response.data.message;

            set((state) => ({
                stocks: state.stocks.map((item) =>
                    item.id === updatedStock.id ? updatedStock : item
                ),
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to edit stock entry.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Delete Stock Entry
    deleteStock: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(deleteStockUrl, data);

            set((state) => ({
                stocks: state.stocks.filter((item) => item.id !== data.r_id),
                isLoading: false,
            }));

            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to delete stock entry.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Clear Error State
    clearError: () => set({ error: null }),
}));