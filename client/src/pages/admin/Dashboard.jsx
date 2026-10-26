import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../api/client';
import { Loader2, AlertCircle, Ticket, ArrowRight, Clock, CheckCircle2, XCircle, Inbox } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Tickets',
      value: stats?.totalTickets ?? 0,
      icon: Ticket,
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-500',
    },
    {
      label: 'Open',
      value: stats?.openTickets ?? 0,
      icon: Inbox,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-500',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTickets ?? 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Resolved',
      value: stats?.resolvedTickets ?? 0,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-500',
    },
    {
      label: 'Closed',
      value: stats?.closedTickets ?? 0,
      icon: XCircle,
      color: 'bg-gray-50 text-gray-500',
      iconColor: 'text-gray-400',
    },
  ];

  const categoryBreakdown = stats?.byCategory || stats?.categoryBreakdown || [];
  const priorityBreakdown = stats?.byPriority || stats?.priorityBreakdown || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Support ticket overview and analytics</p>
        </div>
        <Link to="/admin/tickets" className="btn-primary flex items-center gap-2 text-sm">
          View All Tickets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${card.color}`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            By Category
          </h3>
          {Array.isArray(categoryBreakdown) && categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => {
                const cat = item.category || item._id || item.name || 'Unknown';
                const count = item.count || item._count || 0;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {cat.toLowerCase().replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available</p>
          )}
        </div>

        {/* By Priority */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            By Priority
          </h3>
          {Array.isArray(priorityBreakdown) && priorityBreakdown.length > 0 ? (
            <div className="space-y-3">
              {priorityBreakdown.map((item) => {
                const pri = item.priority || item._id || item.name || 'Unknown';
                const count = item.count || item._count || 0;
                const colors = {
                  CRITICAL: 'text-red-600',
                  HIGH: 'text-orange-600',
                  MEDIUM: 'text-yellow-600',
                  LOW: 'text-emerald-600',
                };
                return (
                  <div key={pri} className="flex items-center justify-between">
                    <span className={`text-sm font-medium capitalize ${colors[pri] || 'text-gray-600'}`}>
                      {pri.toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
