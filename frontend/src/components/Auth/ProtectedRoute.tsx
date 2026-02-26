/**
 * ProtectedRoute Component
 * Wrapper for routes that require authentication
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, getCurrentUser } = useAuth();
  const location = useLocation();

  // Try to get current user on mount if we think we're authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      getCurrentUser().catch(() => {
        // If getting user fails, they'll be redirected to login
      });
    }
  }, [isAuthenticated, isLoading, getCurrentUser]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}
