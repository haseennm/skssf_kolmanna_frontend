import { create } from "zustand";
import axios from "axios"; // Replace with your configured API instance (e.g., import api from '@/config/axios')
import {  createSahachariIssueUrl, getSahachariIssueUrl, returnSahachariIssueUrl } from "./api";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type SahachariStatus = "Issued" | "Returned";
export type SahachariFilter = "all" | "issued" | "returned" | "overdue_3_months";

export interface SahachariIssue {
  id: number;
  user_id: number;
  item_id: number;
  issue_date: string;
  issued_by: string | number;
  return_date: string | null;
  return_by: string | number | null;
  status: SahachariStatus;
  user_name: string;
  item_name: string;
  issued_by_name?: string;
  return_by_name?: string;
}

export interface CreateSahachariPayload {
  user_id: number;
  item_id: number;
  issue_date: string;
  action_by: string | number;
}

export interface ReturnSahachariPayload {
  id: number;
  return_date: string;
  action_by: string | number;
}

export interface SahachariFilterParams {
  search?: string | null;
  filter?: SahachariFilter;
  user_id?: number;
  item_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SahachariStore {
  issues: SahachariIssue[];
  pagination: Pagination;
  filters: SahachariFilterParams;
  loading: boolean;
  error: string | null;

  // Actions
  fetchIssues: (overrideParams?: Partial<SahachariFilterParams & { page?: number; limit?: number }>) => Promise<void>;
  createIssue: (payload: CreateSahachariPayload) => Promise<boolean>;
  returnIssue: (payload: ReturnSahachariPayload) => Promise<boolean>;
  setFilters: (newFilters: Partial<SahachariFilterParams>) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

// ----------------------------------------------------------------------
// Default States
// ----------------------------------------------------------------------

const initialFilters: SahachariFilterParams = {
  search: "",
  filter: "all",
};

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

// ----------------------------------------------------------------------
// Zustand Store Implementation
// ----------------------------------------------------------------------

export const useSahachariIssues = create<SahachariStore>((set, get) => ({
  issues: [],
  pagination: initialPagination,
  filters: initialFilters,
  loading: false,
  error: null,

  // Fetch paginated & filtered list from backend
  fetchIssues: async (overrideParams = {}) => {
    set({ loading: true, error: null });

    const { filters, pagination } = get();

    const requestBody = {
      page: overrideParams.page ?? pagination.page,
      limit: overrideParams.limit ?? pagination.limit,
      search: overrideParams.search !== undefined ? overrideParams.search : filters.search,
      filter: overrideParams.filter ?? filters.filter,
      user_id: overrideParams.user_id ?? filters.user_id,
      item_id: overrideParams.item_id ?? filters.item_id,
      start_date: overrideParams.start_date ?? filters.start_date,
      end_date: overrideParams.end_date ?? filters.end_date,
    };

    try {
      const response = await axios.post(getSahachariIssueUrl, requestBody);
      const { issues, pagination: respPagination } = response.data;

      set({
        issues: issues || [],
        pagination: respPagination || initialPagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch Sahachari issues.",
        loading: false,
      });
    }
  },

  // Create new issue
  createIssue: async (payload: CreateSahachariPayload) => {
    set({ loading: true, error: null });
    try {
      await axios.post(createSahachariIssueUrl, payload);
      // Automatically refresh issue list upon successful creation
      await get().fetchIssues();
      return true;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to issue item.",
        loading: false,
      });
      return false;
    }
  },

  // Process item return
  returnIssue: async (payload: ReturnSahachariPayload) => {
    set({ loading: true, error: null });
    try {
      await axios.post(returnSahachariIssueUrl, payload);
      // Automatically refresh issue list upon successful return
      await get().fetchIssues();
      return true;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to return item.",
        loading: false,
      });
      return false;
    }
  },

  // Update filters and reload page 1
  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({
      filters: updatedFilters,
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchIssues({ ...updatedFilters, page: 1 });
  },

  // Change page
  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchIssues({ page });
  },

  // Reset search and filter parameters
  resetFilters: () => {
    set({ filters: initialFilters, pagination: initialPagination });
    get().fetchIssues({ ...initialFilters, page: 1 });
  },
}));