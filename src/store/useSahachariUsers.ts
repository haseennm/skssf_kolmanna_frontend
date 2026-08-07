import { create } from 'zustand';
import axios from 'axios';
import { createSahachariUsersUrl, deleteSahachariUsersUrl, editSahachariUsersUrl, getSahachariUsersUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface SahachariUser {
  id: number;
  name: string;
  address?: string | null;
  identification_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchUserFilters {
  page?: number;
  limit?: number;
  id?: number;
  search?: string | null;
}

export interface CreateUserPayload {
  name: string;
  address?: string | null;
  identification_name?: string;
  action_by?: string | number;
}

export interface EditUserPayload {
  id: number;
  name?: string;
  address?: string | null;
  identification_name?: string;
  action_by: string | number;
}

export interface DeleteUserPayload {
  r_id: number;
  action_by: string | number;
}

interface SahachariUserState {
  // State
  users: SahachariUser[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (filters?: FetchUserFilters) => Promise<void>;
  createUser: (data: CreateUserPayload) => Promise<boolean>;
  editUser: (data: EditUserPayload) => Promise<boolean>;
  deleteUser: (data: DeleteUserPayload) => Promise<boolean>;
  clearError: () => void;
}

// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useSahachariUsers = create<SahachariUserState>((set) => ({
  users: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch Paginated Sahachari Users
  fetchUsers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(getSahachariUsersUrl, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        ...filters,
      });

      const { users, pagination } = response.data;

      set({
        users: users || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch Sahachari users.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create Sahachari User
  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(createSahachariUsersUrl, data);
      const newUser: SahachariUser = response.data.message;

      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create Sahachari user.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Edit Sahachari User
  editUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(editSahachariUsersUrl, data);
      const updatedUser: SahachariUser =
        response.data.message?.data || response.data.message;

      set((state) => ({
        users: state.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        ),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to edit Sahachari user.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Delete Sahachari User
  deleteUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(deleteSahachariUsersUrl, data);

      set((state) => ({
        users: state.users.filter((user) => user.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete Sahachari user.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Clear Error State
  clearError: () => set({ error: null }),
}));