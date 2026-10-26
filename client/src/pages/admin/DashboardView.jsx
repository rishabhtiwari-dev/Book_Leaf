import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

/**
 * Pure presentation / design component for Operations Admin Dashboard.
 */
export function DashboardView({
  loading,
  error,
  summaryCards,
  categoryBreakdown,
  priorityBreakdown,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
            Tickets by Category
          </h3>
          {Array.isArray(categoryBreakdown) && categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => {
                const displayName =
                  item.name || item.category?.replace(/_/g, ' ') || 'General Inquiry';
                const count = item.count ?? 0;
                return (
                  <div key={item.category || item.name} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{displayName}</span>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
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
            Tickets by Priority
          </h3>
          {Array.isArray(priorityBreakdown) && priorityBreakdown.length > 0 ? (
            <div className="space-y-3">
              {priorityBreakdown.map((item) => {
                const pri = item.priority || 'MEDIUM';
                const count = item.count ?? 0;
                const colors = {
                  CRITICAL: 'text-red-700 bg-red-50 border border-red-200',
                  HIGH: 'text-orange-700 bg-orange-50 border border-orange-200',
                  MEDIUM: 'text-yellow-700 bg-yellow-50 border border-yellow-200',
                  LOW: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
                };
                return (
                  <div key={pri} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {pri.toLowerCase()}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        colors[pri] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {count}
                    </span>
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
