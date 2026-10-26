import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pure Functional Hook: Layout State & Handlers
 * Manages sidebar open/close state, authentication session, and navigation handlers.
 */
export function useLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return {
    user,
    isAdmin,
    sidebarOpen,
    handleLogout,
    closeSidebar,
    openSidebar,
  };
}
