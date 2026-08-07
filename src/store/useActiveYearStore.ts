import { create } from 'zustand';
import axios from 'axios';
import { createActiveYearUrl, deleteActiveYearUrl, editActiveYearUrl, endActiveYearUrl, fetchActiveYearUrl, startActiveYearUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type ActiveYearStatus = 'Soon' | 'Open' | 'End';

export interface ActiveYear {
  id: number;
  year_title: string;
  status: ActiveYearStatus | string;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchActiveYearFilters {
  page?: number;
  limit?: number;
  id?: number;
  search?: string | null;
  status?: number | string;
}

export interface CreateActiveYearPayload {
  year_title: string; // Format: "YYYY-YYYY" e.g., "2026-2028"
  status?: ActiveYearStatus;
  created_by: string | number;
}

export interface EditActiveYearPayload {
  id: number;
  year_title?: string;
  status?: 'Open' | 'End';
  start_date?: string;
  end_date?: string;
  updated_by: string | number;
}

export interface DeleteActiveYearPayload {
  r_id: number;
  action_by: string | number;
}

export interface ChangeStatusYearPayload {
  id: number;
}

interface ActiveYearState {
  // State
  activeYears: ActiveYear[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActiveYears: (filters?: FetchActiveYearFilters) => Promise<void>;
  createActiveYear: (data: CreateActiveYearPayload) => Promise<boolean>;
  editActiveYear: (data: EditActiveYearPayload) => Promise<boolean>;
  deleteActiveYear: (data: DeleteActiveYearPayload) => Promise<boolean>;
  startActiveYear: (data: ChangeStatusYearPayload) => Promise<boolean>;
  endActiveYear: (data: ChangeStatusYearPayload) => Promise<boolean>;
  clearError: () => void;
}



// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useActiveYearStore = create<ActiveYearState>((set) => ({
  activeYears: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Active Years
  fetchActiveYears: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(fetchActiveYearUrl, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        ...filters,
      });

      const { activeYears, pagination } = response.data;

      set({
        activeYears: activeYears || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch active years.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Active Year
  createActiveYear: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(createActiveYearUrl, data);
      const newActiveYear: ActiveYear = response.data.message;

      set((state) => ({
        activeYears: [newActiveYear, ...state.activeYears],
        isLoading: false,
      }));

      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);

        const errorMessage =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message;

        set({
          error: errorMessage,
          isLoading: false,
        });
      } else {
        set({
          error: "Failed to create active year.",
          isLoading: false,
        });
      }

      return false;
    }
  },

  // Edit Active Year
  editActiveYear: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(editActiveYearUrl, data);
      const updatedActiveYear: ActiveYear =
        response.data.message?.data || response.data.message;

      set((state) => ({
        activeYears: state.activeYears.map((item) =>
          item.id === updatedActiveYear.id ? updatedActiveYear : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update active year.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Active Year
  deleteActiveYear: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(deleteActiveYearUrl, data);

      set((state) => ({
        activeYears: state.activeYears.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete active year.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Start Active Year
  startActiveYear: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(startActiveYearUrl, data);
      const updatedRecord: ActiveYear =
        response.data.message?.data || response.data.message;

      set((state) => ({
        activeYears: state.activeYears.map((item) =>
          item.id === data.id ? { ...item, ...updatedRecord, status: 'Open' } : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to start active year.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // End Active Year
  endActiveYear: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(endActiveYearUrl, data);
      const updatedRecord: ActiveYear =
        response.data.message?.data || response.data.message;

      set((state) => ({
        activeYears: state.activeYears.map((item) =>
          item.id === data.id ? { ...item, ...updatedRecord, status: 'End' } : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to end active year.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));