import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import './dashboard.design.css';

/**
 * Pure Visual Design Component: Operations Admin Analytics Dashboard.
 * 0 inline calculations, 0 string formatting, 0 state logic.
 */
export function DashboardDesign({
  loading,
  error,
  counts,
  categoryBreakdown,
  hasCategories,
  priorityBreakdown,
  hasPriorities,
}) {
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
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Tickets',
      value: counts.total,
      icon: Ticket,
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-500',
    },
    {
      label: 'Open',
      value: counts.open,
      icon: Inbox,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-500',
    },
    {
      label: 'In Progress',
      value: counts.inProgress,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Resolved',
      value: counts.resolved,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-500',
    },
    {
      label: 'Closed',
      value: counts.closed,
      icon: XCircle,
      color: 'bg-gray-50 text-gray-500',
      iconColor: 'text-gray-400',
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 mt-1">Author support queue overview, SLA metrics, and analytics</p>
        </div>
        <Link to="/admin/tickets" className="btn-primary flex items-center gap-2 text-sm">
          View All Tickets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="admin-metrics-grid">
        {metricCards.map((card) => (
          <div key={card.label} className="admin-metric-card">
            <div className={`admin-metric-icon-box ${card.color}`}>
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
      <div className="admin-breakdowns-grid">
        {/* By Category */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Tickets by Category
          </h3>
          {hasCategories ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available</p>
          )}
        </div>

        {/* By Priority */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Tickets by Priority
          </h3>
          {hasPriorities ? (
            <div className="space-y-3">
              {priorityBreakdown.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.displayName}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${item.styleClass}`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardDesign;

