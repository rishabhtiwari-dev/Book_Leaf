import React from 'react';
import { useDashboard } from './useDashboard';
import { DashboardView } from './DashboardView';

/**
 * Admin Dashboard Page Container.
 * Binds functional metrics from useDashboard to visual layout in DashboardView.
 */
export default function Dashboard() {
  const {
    loading,
    error,
    counts,
    categoryBreakdown,
    priorityBreakdown,
  } = useDashboard();

  return (
    <DashboardView
      loading={loading}
      error={error}
      counts={counts}
      categoryBreakdown={categoryBreakdown}
      priorityBreakdown={priorityBreakdown}
    />
  );
}
