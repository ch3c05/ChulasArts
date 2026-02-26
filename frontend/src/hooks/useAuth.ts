/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, SignupRequest, User } from '../../../shared/types/user';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    getCurrentUser,
    updateProfile,
    clearError,
  } = useAuthStore();

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // If token exists but no user, fetch current user
    if (token && !user && !isLoading) {
      getCurrentUser();
    }
  }, [user, isLoading, getCurrentUser]);

  /**
   * Login wrapper
   */
  const handleLogin = async (credentials: LoginRequest): Promise<void> => {
    await login(credentials);
  };

  /**
   * Signup wrapper
   */
  const handleSignup = async (data: SignupRequest): Promise<void> => {
    await signup(data);
  };

  /**
   * Logout wrapper
   */
  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  /**
   * Update profile wrapper
   */
  const handleUpdateProfile = async (data: Partial<User>): Promise<void> => {
    await updateProfile(data);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    getCurrentUser,
    updateProfile: handleUpdateProfile,
    clearError,
  };
}
