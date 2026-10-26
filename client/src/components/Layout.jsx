import React from 'react';
import { useLayout } from './useLayout';
import { LayoutView } from './LayoutView';

/**
 * Layout Container Component.
 * Binds functional logic from useLayout to visual shell in LayoutView.
 */
export default function Layout({ children }) {
  const {
    user,
    isAdmin,
    sidebarOpen,
    handleLogout,
    closeSidebar,
    openSidebar,
  } = useLayout();

  return (
    <LayoutView
      user={user}
      isAdmin={isAdmin}
      sidebarOpen={sidebarOpen}
      onLogout={handleLogout}
      onCloseSidebar={closeSidebar}
      onOpenSidebar={openSidebar}
    >
      {children}
    </LayoutView>
  );
}
