import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import MyBooks from './pages/author/MyBooks';
import MyTickets from './pages/author/MyTickets';
import SubmitTicket from './pages/author/SubmitTicket';
import AuthorTicketDetail from './pages/author/TicketDetail';
import Dashboard from './pages/admin/Dashboard';
import TicketQueue from './pages/admin/TicketQueue';
import AdminTicketDetail from './pages/admin/TicketDetail';

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/author/books'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Author Routes */}
      <Route
        path="/author/books"
        element={
          <ProtectedRoute role="AUTHOR">
            <Layout><MyBooks /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/author/tickets"
        element={
          <ProtectedRoute role="AUTHOR">
            <Layout><MyTickets /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/author/tickets/new"
        element={
          <ProtectedRoute role="AUTHOR">
            <Layout><SubmitTicket /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/author/tickets/:id"
        element={
          <ProtectedRoute role="AUTHOR">
            <Layout><AuthorTicketDetail /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute role="ADMIN">
            <Layout><TicketQueue /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets/:id"
        element={
          <ProtectedRoute role="ADMIN">
            <Layout><AdminTicketDetail /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#111827', border: '1px solid #e5e7eb' },
          }}
        />
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}
