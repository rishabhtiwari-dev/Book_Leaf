import { useAuth } from '../context/AuthContext';

/**
 * Pure Functional Hook: Root URL Redirection Logic.
 * Evaluates session state and determines where the user should be routed.
 * @returns {{ loading: boolean, redirectTarget: string|null }}
 */
export function useRootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return { loading: true, redirectTarget: null };
  }

  if (!isAuthenticated) {
    return { loading: false, redirectTarget: '/login' };
  }

  return {
    loading: false,
    redirectTarget: isAdmin ? '/admin/dashboard' : '/author/books',
  };
}

