import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, Search, Filter, Ticket } from 'lucide-react';
import './ticketQueue.design.css';

/**
 * Pure Visual Design Component: Operations Ticket Queue Table & Filter Toolbar.
 * Contains 0 inline calculations, 0 date formatters, and 0 inline arrow functions.
 */
export function TicketQueueDesign({
  tickets,
  hasTickets,
  loading,
  error,
  status,
  category,
  priority,
  search,
  statusOptions,
  categoryOptions,
  priorityOptions,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onSearchChange,
  onSearchKeyDown,
  onSearchSubmit,
}) {
  return (
    <div className="admin-queue-container">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1>
        <p className="text-gray-500 mt-1">Manage, triage, and respond to incoming author queries</p>
      </div>

      {/* Filter Toolbar */}
      <div className="card">
        <div className="admin-queue-filters">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>

          <select
            value={status}
            onChange={onStatusChange}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">All Status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={onCategoryChange}
            className="input-field w-auto text-sm py-1.5"
          >
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={priority}
            onChange={onPriorityChange}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <div className="admin-queue-search-box">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
                placeholder="Search subject, description, ticket #…"
                className="input-field pl-9 text-sm py-1.5"
              />
            </div>
            <button
              onClick={onSearchSubmit}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table Data or Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      ) : !hasTickets ? (
        <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tickets match your filters.</p>
        </div>
      ) : (
        <div className="card admin-queue-table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Book</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                    t.isCritical ? 'admin-queue-critical-row' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/tickets/${t.id}`}
                      className="font-mono text-xs font-bold text-emerald-700 hover:underline"
                    >
                      {t.formattedTicketNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <Link
                      to={`/admin/tickets/${t.id}`}
                      className="font-medium text-gray-900 hover:text-emerald-700 block truncate"
                      title={t.subject}
                    >
                      {t.subject}
                    </Link>
                    {t.responsesText && (
                      <span className="text-[10px] text-gray-400">
                        {t.responsesText}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="font-semibold">{t.authorName}</div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[120px]">
                      {t.authorEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">
                    {t.bookTitle}
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={t.category} />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                    {t.formattedDate || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {t.assignedToName ? (
                      <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                        👤 {t.assignedToName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TicketQueueDesign;

