import { create } from 'zustand';
import axios from 'axios';
import { baseurl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface LedgerCategory {
  id: string | number;
  name: string;
  note: string | null;
  created_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchLedgerCategoryFilters {
  page?: number;
  limit?: number;
  id?: number | string;
  search?: string | null;
}

export interface CreateLedgerCategoryPayload {
  name: string;
  note?: string | null;
  active_year_id: number;
  action_by: number;
}

export interface EditLedgerCategoryPayload {
  id: number | string;
  name?: string;
  note?: string | null;
  active_year_id: number;
  action_by: number;
}

export interface DeleteLedgerCategoryPayload {
  active_year_id: number;
  action_by: number;
  r_id: number | string;
}

interface LedgerCategoryState {
  // State
  categories: LedgerCategory[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (filters?: FetchLedgerCategoryFilters) => Promise<void>;
  createCategory: (data: CreateLedgerCategoryPayload) => Promise<boolean>;
  editCategory: (data: EditLedgerCategoryPayload) => Promise<boolean>;
  deleteCategory: (data: DeleteLedgerCategoryPayload) => Promise<boolean>;
  clearError: () => void;
}

export const useLedgerCategory = create<LedgerCategoryState>((set) => ({
  categories: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchCategories: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/payment/category/get`, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        ...filters,
      });

      const { categories, pagination } = response.data;
      set({
        categories: categories || response.data,
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch categories.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Category
  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/payment/category/create`, data);
      const newCategory: LedgerCategory = response.data.message;

      set((state) => ({
        categories: [newCategory, ...state.categories],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create category.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Category
  editCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/payment/category/edit`, data);
      const updatedCategory: LedgerCategory =
        response.data.message?.data || response.data.message;

      set((state) => ({
        categories: state.categories.map((item) =>
          String(item.id) === String(updatedCategory.id) ? updatedCategory : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to edit category.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Category
  deleteCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${baseurl}/payment/category/delete`, data);

      set((state) => ({
        categories: state.categories.filter(
          (item) => String(item.id) !== String(data.r_id)
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete category.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));