import React from 'react';
import { useLayout } from './useLayout';
import { LayoutView } from './LayoutView';

/**
 * Layout Container Component.
 * Binds functional business logic from useLayout to presentation in LayoutView.
 */
export default function Layout({ children }) {
  const {
    user,
    isAdmin,
    sidebarOpen,
    links,
    handleLogout,
    closeSidebar,
    openSidebar,
  } = useLayout();

  return (
    <LayoutView
      user={user}
      isAdmin={isAdmin}
      sidebarOpen={sidebarOpen}
      links={links}
      onLogout={handleLogout}
      onCloseSidebar={closeSidebar}
      onOpenSidebar={openSidebar}
    >
      {children}
    </LayoutView>
  );
}
