/**
 * Authentication Store
 * Zustand store for user authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, SignupRequest } from '../../../shared/types/user';
import apiClient, { handleApiError } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user with email and password
       */
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/auth/login', credentials);
          const user = response.data; // User data returned directly, tokens in httpOnly cookies

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      /**
       * Sign up new user
       */
      signup: async (data: SignupRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/auth/signup', data);
          const user = response.data; // User data returned directly, tokens in httpOnly cookies

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      /**
       * Logout current user
       */
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await apiClient.post('/auth/logout');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({ error: errorMessage, isLoading: false });

          // Still clear local state even if API call fails
          set({ user: null, isAuthenticated: false });
        }
      },

      /**
       * Get current authenticated user
       */
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get('/auth/me');
          const user = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });

          // Clear invalid token
          localStorage.removeItem('accessToken');
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.patch('/users/me', data);
          const user = response.data.data;

          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
