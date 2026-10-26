import { useAuth } from '../context/AuthContext';

/**
 * Pure Functional Hook: Route Guard Logic
 * Determines authentication and authorization state for protected routes.
 * @param {string} [requiredRole]
 * @returns {{ loading: boolean, shouldRedirect: boolean, redirectPath: string }}
 */
export function useProtectedRoute(requiredRole) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return { loading: true, shouldRedirect: false, redirectPath: '' };
  }

  if (!isAuthenticated) {
    return { loading: false, shouldRedirect: true, redirectPath: '/login' };
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/author/books';
    return { loading: false, shouldRedirect: true, redirectPath };
  }

  return { loading: false, shouldRedirect: false, redirectPath: '' };
}
