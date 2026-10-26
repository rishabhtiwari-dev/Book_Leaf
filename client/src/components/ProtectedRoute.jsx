import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProtectedRoute } from './useProtectedRoute';
import { LoadingScreen } from './LoadingScreen';

/**
 * Route Guard Component.
 * Binds functional protection logic from useProtectedRoute to visual LoadingScreen / route redirect.
 */
export default function ProtectedRoute({ children, role }) {
  const { loading, shouldRedirect, redirectPath } = useProtectedRoute(role);

  if (loading) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
