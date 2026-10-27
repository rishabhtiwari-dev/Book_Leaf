import { useState, useEffect } from 'react';
import { getAdminStats } from '../../api/client';

const PRIORITY_STYLES = {
  CRITICAL: 'text-red-700 bg-red-50 border border-red-200',
  HIGH: 'text-orange-700 bg-orange-50 border border-orange-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border border-yellow-200',
  LOW: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
};

/**
 * Pure Functional Controller: Admin Dashboard Metrics Logic.
 * Computes all metrics, pre-formats category and priority arrays.
 */
export function useDashboardFunction() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = () => {
    setLoading(true);
    getAdminStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const counts = {
    total: stats?.totalTickets ?? stats?.stats?.tickets?.total ?? 0,
    open: stats?.openTickets ?? stats?.stats?.tickets?.open ?? 0,
    inProgress: stats?.inProgressTickets ?? stats?.stats?.tickets?.inProgress ?? 0,
    resolved: stats?.resolvedTickets ?? stats?.stats?.tickets?.resolved ?? 0,
    closed: stats?.closedTickets ?? stats?.stats?.tickets?.closed ?? 0,
  };

  const categoryBreakdown = (stats?.byCategory || []).map((item) => ({
    name: item.name || item.category || 'General',
    count: item.count ?? 0,
  }));

  const priorityBreakdown = (stats?.byPriority || []).map((item) => {
    const pri = item.priority || 'MEDIUM';
    return {
      priority: pri,
      displayName: pri.charAt(0) + pri.slice(1).toLowerCase(),
      styleClass: PRIORITY_STYLES[pri] || 'bg-gray-100 text-gray-700',
      count: item.count ?? 0,
    };
  });

  return {
    loading,
    error,
    counts,
    categoryBreakdown,
    hasCategories: categoryBreakdown.length > 0,
    priorityBreakdown,
    hasPriorities: priorityBreakdown.length > 0,
    refreshStats: fetchStats,
  };
}

