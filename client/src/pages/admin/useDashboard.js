import { useState, useEffect } from 'react';
import { getAdminStats } from '../../api/client';

/**
 * Pure Functional Hook: Operations Metrics & SLA Analytics Data.
 * Contains no visual icons or styling definitions.
 */
export function useDashboard() {
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

  const categoryBreakdown = stats?.byCategory || [];
  const priorityBreakdown = stats?.byPriority || [];

  return {
    loading,
    error,
    counts,
    categoryBreakdown,
    priorityBreakdown,
    refreshStats: fetchStats,
  };
}
