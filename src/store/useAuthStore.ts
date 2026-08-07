import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';
import {  createUserUrl, deleteUserUrl, loginUserUrl } from './api';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface User {
  id: number | string;
  name: string;
  username: string;
  email: string;
  role: string[];
  active_year_id: number;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}
export interface LoginErrorResponse {
  success: boolean;
  error: {
    statusCode: number;
    message: string
  }
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string[];
  active_year_id: number;
  action_by: number | string;
  address?: string | null;
  phone_number?: string | null;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginUser: (credentials: LoginCredentials) => Promise<boolean>;
  registerUser: (data: RegisterCredentials) => Promise<boolean>;
  logoutUser: () => void;
  deleteUser: (userId: number, activeYearId: number, actionBy: number | string) => Promise<boolean>;
  clearError: () => void;
}

// ----------------------------------------------------------------------
// Zustand Store
// ----------------------------------------------------------------------
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      action_by:null,

      // Login Action
      loginUser: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(loginUserUrl, credentials);
          const { token, user } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err) {
          const error = err as AxiosError<LoginErrorResponse>;
          const errorMessage =
            error.response?.data?.error?.message ??
            "Login failed. Please try again.";
          set({
            error: errorMessage,
            isLoading: false,
          });
          return false;
        }
      },

      // Register Action
      registerUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(createUserUrl, data);
          set({ isLoading: false });
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Registration failed.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Logout Action
      logoutUser: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Delete User Action
      deleteUser: async (r_id, active_year_id, action_by) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          await axios.post(
            deleteUserUrl,
            { r_id, active_year_id, action_by },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // If current logged-in user is deleting themselves, log out
          if (get().user?.id === r_id) {
            get().logoutUser();
          } else {
            set({ isLoading: false });
          }
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Failed to delete user.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Helper to clear errors manually
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // Key name in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist specific state fields (skip isLoading, error)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);