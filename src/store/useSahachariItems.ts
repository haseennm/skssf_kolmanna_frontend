import { create } from 'zustand';
import axios from 'axios';
import {  createSahachariItemsUrl, deleteSahachariItemsUrl, editSahachariItemsUrl, getSahachariItemsUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface SahachariItem {
  id: number;
  name: string;
  description?: string | null;
  item_code: string;
  status: number;
  amount: null | number;
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
  search?: string | null;
  status?: number;
}

export interface CreateItemPayload {
  name: string;
  description?: string;
  item_code: string[];
  amount?: number;
  action_by?: string | number;
}

export interface EditItemPayload {
  id: number;
  name?: string;
  description?: string;
  item_code?: string;
  amount?: number;
  status?: number;
  action_by: string | number;
}

export interface DeleteItemPayload {
  r_id: number;
  action_by: string | number;
}

interface SahachariItemState {
  // State
  items: SahachariItem[];
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
export const useSahachariItems = create<SahachariItemState>((set) => ({
  items: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Paginated Sahachari Items
  fetchItems: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(getSahachariItemsUrl, {
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
        err.response?.data?.message || 'Failed to fetch Sahachari items.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Sahachari Item(s) - prepends array of newly created items to state
  createItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(createSahachariItemsUrl, data);
      
      const newItems: SahachariItem[] = Array.isArray(response.data.message)
        ? response.data.message
        : [response.data.message];

      set((state) => ({
        items: [...newItems, ...state.items],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create Sahachari item(s).';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Sahachari Item
  editItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(editSahachariItemsUrl, data);
      const updatedItem: SahachariItem =
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
        err.response?.data?.message || 'Failed to edit Sahachari item.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Sahachari Item
  deleteItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(deleteSahachariItemsUrl, data);

      set((state) => ({
        items: state.items.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete Sahachari item.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));