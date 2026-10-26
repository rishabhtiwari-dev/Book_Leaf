import { useState, useEffect } from 'react';
import { getAdminStats } from '../../api/client';
import { Ticket, Clock, CheckCircle2, XCircle, Inbox } from 'lucide-react';

/**
 * Custom hook managing operations analytics and statistics state for the Admin Dashboard.
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

  const summaryCards = [
    {
      label: 'Total Tickets',
      value: stats?.totalTickets ?? stats?.stats?.tickets?.total ?? 0,
      icon: Ticket,
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-500',
    },
    {
      label: 'Open',
      value: stats?.openTickets ?? stats?.stats?.tickets?.open ?? 0,
      icon: Inbox,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-500',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTickets ?? stats?.stats?.tickets?.inProgress ?? 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Resolved',
      value: stats?.resolvedTickets ?? stats?.stats?.tickets?.resolved ?? 0,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-500',
    },
    {
      label: 'Closed',
      value: stats?.closedTickets ?? stats?.stats?.tickets?.closed ?? 0,
      icon: XCircle,
      color: 'bg-gray-50 text-gray-500',
      iconColor: 'text-gray-400',
    },
  ];

  const categoryBreakdown = stats?.byCategory || [];
  const priorityBreakdown = stats?.byPriority || [];

  return {
    loading,
    error,
    summaryCards,
    categoryBreakdown,
    priorityBreakdown,
    refreshStats: fetchStats,
  };
}
