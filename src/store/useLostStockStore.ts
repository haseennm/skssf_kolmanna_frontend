import { create } from 'zustand';
import axios from 'axios';
import { baseurl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface LostStock {
  id: number;
  stock_id: number;
  quantity: number;
  reason?: string | null;
  active_year_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchLostStockFilters {
  page?: number;
  limit?: number;
  id?: number;
  stock_id?: number;
  active_year_id?: number;
  search?: string | null;
}

export interface CreateLostStockPayload {
  stock_id: number;
  quantity: number;
  reason?: string | null;
  active_year_id: number;
  action_by: string | number;
}

export interface EditLostStockPayload {
  id: number;
  stock_id?: number;
  quantity?: number;
  reason?: string | null;
  active_year_id: number;
  action_by: string | number;
}

export interface DeleteLostStockPayload {
  r_id: number;
  active_year_id: number;
  action_by: string | number;
}

interface LostStockState {
  // State
  lostStocks: LostStock[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLostStocks: (filters?: FetchLostStockFilters) => Promise<void>;
  createLostStock: (data: CreateLostStockPayload) => Promise<boolean>;
  editLostStock: (data: EditLostStockPayload) => Promise<boolean>;
  deleteLostStock: (data: DeleteLostStockPayload) => Promise<boolean>;
  clearError: () => void;
}

// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useLostStockStore = create<LostStockState>((set) => ({
  lostStocks: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Paginated Lost Stock Records
  fetchLostStocks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/lost/stock/get`, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        ...filters,
      });
      const { lost_stocks, pagination } = response.data;

      set({
        lostStocks: lost_stocks || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch lost stock records.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Lost Stock Record
  createLostStock: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/lost/stock/create`, data);
      const newRecord: LostStock = response.data.message;

      set((state) => ({
        lostStocks: [newRecord, ...state.lostStocks],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create lost stock record.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Lost Stock Record
  editLostStock: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/lost/stock/edit`, data);
      const updatedRecord: LostStock =
        response.data.message?.data || response.data.message;

      set((state) => ({
        lostStocks: state.lostStocks.map((item) =>
          item.id === updatedRecord.id ? updatedRecord : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to edit lost stock record.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Lost Stock Record
  deleteLostStock: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${baseurl}/lost/stock/delete`, data);

      set((state) => ({
        lostStocks: state.lostStocks.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete lost stock record.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));