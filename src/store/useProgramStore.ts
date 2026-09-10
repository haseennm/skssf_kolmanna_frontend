import { create } from 'zustand';
import axios from 'axios';
import {createProgramUrl, deleteProgramUrl, editProgramUrl, getProgramUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface Program {
  id: number;
  title: string;
  wing: string;
  date: string;
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

export interface FetchProgramFilters {
  page?: number;
  limit?: number;
  id?: number;
  active_year_id?: number;
  search?: string | null;
}

export interface CreateProgramPayload {
  title: string;
  wing: string;
  date: string;
  active_year_id: number;
  action_by: number | string;
}

export interface EditProgramPayload {
  id: number;
  active_year_id: number;
  title?: string;
  wing?: string;
  date?: string;
  action_by: string | number;
}

export interface DeleteProgramPayload {
  r_id: number;
  active_year_id: number;
  action_by: number | string;
}

interface ProgramState {
  // State
  programs: Program[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrograms: (filters?: FetchProgramFilters) => Promise<void>;
  createProgram: (data: CreateProgramPayload) => Promise<boolean>;
  editProgram: (data: EditProgramPayload) => Promise<boolean>;
  deleteProgram: (data: DeleteProgramPayload) => Promise<boolean>;
  clearError: () => void;
}


// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useProgramStore = create<ProgramState>((set) => ({
  programs: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Paginated Programs
  fetchPrograms: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(getProgramUrl, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 100,
        ...filters,
      });

      const { programs, pagination } = response.data;
      set({
        programs: programs || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch programs.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Program
  createProgram: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(createProgramUrl, data);
      const newProgram: Program = response.data.message;

      set((state) => ({
        programs: [newProgram, ...state.programs],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create program.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Program
  editProgram: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(editProgramUrl, data);
      const updatedProgram: Program =
        response.data.message?.data || response.data.message;

      set((state) => ({
        programs: state.programs.map((item) =>
          item.id === updatedProgram.id ? updatedProgram : item
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to edit program.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Program
  deleteProgram: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(deleteProgramUrl, data);

      set((state) => ({
        programs: state.programs.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete program.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));