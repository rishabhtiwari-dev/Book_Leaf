import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Ticket,
  PlusCircle,
  LayoutDashboard,
  ListTodo,
} from 'lucide-react';

const authorLinks = [
  { to: '/author/books', label: 'My Books', icon: BookOpen },
  { to: '/author/tickets', label: 'My Tickets', icon: Ticket },
  { to: '/author/tickets/new', label: 'New Ticket', icon: PlusCircle },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/tickets', label: 'All Tickets', icon: ListTodo },
];

/**
 * Custom hook containing all business logic, navigation, and state for the Layout component.
 */
export function useLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = isAdmin ? adminLinks : authorLinks;

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
    links,
    handleLogout,
    closeSidebar,
    openSidebar,
  };
}
