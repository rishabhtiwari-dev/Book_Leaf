import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRootRedirect } from './useRootRedirect';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

import Login from '../pages/Login';
import MyBooks from '../pages/author/MyBooks';
import MyTickets from '../pages/author/MyTickets';
import SubmitTicket from '../pages/author/SubmitTicket';
import AuthorTicketDetail from '../pages/author/TicketDetail';
import Dashboard from '../pages/admin/Dashboard';
import TicketQueue from '../pages/admin/TicketQueue';
import AdminTicketDetail from '../pages/admin/TicketDetail';

function RootRedirect() {
  const { loading, redirectTarget } = useRootRedirect();
  if (loading || !redirectTarget) return null;
  return <Navigate to={redirectTarget} replace />;
}

/**
 * Pure Route Definition Component.
 * Maps URL paths to protected container layouts.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Author Portal Routes */}
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

      {/* Operations Admin Portal Routes */}
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

      {/* Root & Fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

