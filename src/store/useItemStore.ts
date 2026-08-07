import { create } from 'zustand';
import axios from 'axios';
import { baseurl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface Item {
  id: number;
  name: string;
  note?: string | null;
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

export interface FetchItemFilters {
  page?: number;
  limit?: number;
  id?: number;
  active_year_id?: number;
  search?: string | null;
}

export interface CreateItemPayload {
  name: string;
  note?: string | null;
  active_year_id: number;
  action_by: string | number;
}

export interface EditItemPayload {
  id: number;
  name?: string;
  note?: string | null;
  active_year_id: number;
  action_by: string | number;
}

export interface DeleteItemPayload {
  r_id: number;
  active_year_id: number;
  action_by: string | number;
}

interface ItemState {
  // State
  items: Item[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: (filters?: FetchItemFilters) => Promise<void>;
  createItem: (data: CreateItemPayload) => Promise<boolean>;
  editItem: (data: EditItemPayload) => Promise<boolean>;
  deleteItem: (data: DeleteItemPayload) => Promise<boolean>;
  clearError: () => void;
}



// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useItemStore = create<ItemState>((set) => ({
  items: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Paginated Items
  fetchItems: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/item/get`, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        ...filters,
      });

      const { items, pagination, data } = response.data;

      set({
        items: items || data || response.data || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch items.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Item
  createItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/item/create`, data);
      const newItem: Item = response.data.message;

      set((state) => ({
        items: [newItem, ...state.items],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create item.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Item
  editItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/item/edit`, data);
      const updatedItem: Item =
        response.data.message?.data || response.data.message;

      set((state) => ({
        items: state.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to edit item.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Item
  deleteItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${baseurl}/item/delete`, data);

      set((state) => ({
        items: state.items.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete item.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));