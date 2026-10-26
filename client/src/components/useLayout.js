import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pure Functional Controller: Layout State & Handlers
 * Manages sidebar open/close state, authentication session, user initials, badge styles, and navigation handlers.
 */
export function useLayoutFunction() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const roleBadgeClass = isAdmin
    ? 'bg-purple-100 text-purple-700'
    : 'bg-emerald-100 text-emerald-700';

  return {
    user,
    userInitial,
    roleBadgeClass,
    isAdmin,
    sidebarOpen,
    onLogout: handleLogout,
    onCloseSidebar: closeSidebar,
    onOpenSidebar: openSidebar,
  };
}

export { useLayoutFunction as useLayout };
