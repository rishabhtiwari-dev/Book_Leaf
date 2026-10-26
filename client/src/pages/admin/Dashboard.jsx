import React from 'react';
import { useDashboard } from './useDashboard';
import { DashboardView } from './DashboardView';

/**
 * Admin Dashboard Page Container.
 * Binds functional metrics fetching and analytics calculation from useDashboard to presentation in DashboardView.
 */
export default function Dashboard() {
  const {
    loading,
    error,
    summaryCards,
    categoryBreakdown,
    priorityBreakdown,
  } = useDashboard();

  return (
    <DashboardView
      loading={loading}
      error={error}
      summaryCards={summaryCards}
      categoryBreakdown={categoryBreakdown}
      priorityBreakdown={priorityBreakdown}
    />
  );
}
