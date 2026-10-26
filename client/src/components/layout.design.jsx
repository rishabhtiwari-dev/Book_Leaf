import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Ticket,
  PlusCircle,
  LayoutDashboard,
  ListTodo,
  Leaf,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const AUTHOR_NAV_ITEMS = [
  { to: '/author/books', label: 'My Books', icon: BookOpen },
  { to: '/author/tickets', label: 'My Tickets', icon: Ticket },
  { to: '/author/tickets/new', label: 'New Ticket', icon: PlusCircle },
];

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/tickets', label: 'All Tickets', icon: ListTodo },
];

const navLinkClasses = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-emerald-50 text-emerald-700 font-semibold'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

/**
 * Pure Visual Design Component: Application Shell & Sidebar Layout.
 * 0 inline calculations, 0 state logic.
 */
export function LayoutDesign({
  children,
  user,
  userInitial,
  roleBadgeClass,
  isAdmin,
  sidebarOpen,
  onLogout,
  onCloseSidebar,
  onOpenSidebar,
}) {
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : AUTHOR_NAV_ITEMS;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg shadow-sm">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">BookLeaf</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Support Portal</p>
          </div>
          <button
            onClick={onCloseSidebar}
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClasses}
              onClick={onCloseSidebar}
            >
              <item.icon className="h-5 w-5 text-emerald-600" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-emerald-100 rounded-full text-emerald-700 font-semibold text-sm">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <span
                className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${roleBadgeClass}`}
              >
                {user?.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-gray-900">BookLeaf</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default LayoutDesign;
