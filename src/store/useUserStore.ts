import { create } from 'zustand';
import axios from 'axios';
import { baseurl, createUserUrl, deleteUserUrl, editUserUrl, getUserUrl, movetoCurrentYearUrl, requestUpdatePasswordUrl, updatePasswordUrl } from './api';
import { useAuthStore } from './useAuthStore';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type UserRole =
  | 'ledger handle'
  | 'sahachari handle'
  | 'program handle'
  | 'stock handle'
  | 'all handle';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address?: string | null;
  phone_number?: string | null;
  role: UserRole[];
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

export interface FetchUserFilters {
  page?: number;
  limit?: number;
  id?: number;
  active_year_id?: number;
  search?: string | null;
  action_by: string | number;
}

export interface CreateUserPayload {
  name: string;
  address?: string | null;
  username: string;
  email: string;
  action_by: string | number;
  phone_number?: string | null;
  password: string;
  active_year_id: number;
  role: UserRole[];
}

export interface EditUserPayload {
  id: number | string;
  active_year_id: number;
  name?: string;
  address?: string | null;
  username?: string;
  email?: string;
  phone_number?: string | null;
  password?: string;
  action_by: string | number;
  role?: UserRole[];
  self_edit?: boolean;
}

export interface DeleteUserPayload {
  r_id: number;
  active_year_id: number;
  action_by: string | number;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface MoveToCurrentCommitteePayload {
  user_id: number;
  action_by: number;
}

export interface ChangePasswordPayload {
  email: string;
  password: string;
}

export interface VerifyUserForPasswordPayload {
  email: string;
}

interface UserState {
  // State
  users: User[];
  currentUser: User | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (filters: FetchUserFilters) => Promise<void>;
  createUser: (data: CreateUserPayload) => Promise<boolean>;
  editUser: (data: EditUserPayload) => Promise<boolean>;
  deleteUser: (data: DeleteUserPayload) => Promise<boolean>;
  loginUser: (data: LoginPayload) => Promise<boolean>;
  moveToCurrentCommittee: (data: MoveToCurrentCommitteePayload) => Promise<boolean>;
  changePassword: (data: ChangePasswordPayload) => Promise<boolean>;
  verifyUserForPassword: (data: VerifyUserForPasswordPayload) => Promise<boolean>;
  clearError: () => void;
}

// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useuserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchUsers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(getUserUrl, {
        page: filters.page ?? 1,
        limit: filters.limit ?? 100,
        ...filters,
      });

      const { users, pagination, data } = response.data;

      set({
        users: users || data || response.data || [],
        pagination: pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch users.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(createUserUrl, data);
      const newUser: User = response.data.message;

      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create user.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  editUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(editUserUrl, data);
      
      const updatedUser: User =
        response.data.message?.data || response.data.message;

      set((state) => ({
        users: state.users
          ? state.users.map((item) =>
              item.id === updatedUser.id ? updatedUser : item
            )
          : state.users,
        currentUser: data?.self_edit ? updatedUser : state.currentUser,
        isLoading: false,
      }));

      if (data?.self_edit && updatedUser) {
        useAuthStore.getState().setUser(updatedUser as any);
      }

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to edit user.";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(deleteUserUrl, data);

      set((state) => ({
        users: state.users.filter((item) => item.id !== data.r_id),
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete user.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  loginUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${baseurl}/user/login`, data);
      const loggedUser = response.data.user || response.data;
      set({
        currentUser: loggedUser,
        isLoading: false,
      });

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  moveToCurrentCommittee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(movetoCurrentYearUrl, data);
      const updatedUser: User =
        response.data.message?.data || response.data.message || response.data.user;

      if (updatedUser?.id) {
        set((state) => ({
          users: state.users.map((item) =>
            item.id === updatedUser.id ? updatedUser : item
          ),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to move user to current committee.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Change Password Action
  changePassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(requestUpdatePasswordUrl, data);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to change password.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Verify User For Password Reset Action
  verifyUserForPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(updatePasswordUrl, data);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Failed to verify user details.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));