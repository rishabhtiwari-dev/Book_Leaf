import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, Search, Filter, Ticket } from 'lucide-react';
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './useTicketQueue';

/**
 * Pure Visual Design Component: Operations Admin Ticket Queue Table & Filters.
 */
export function TicketQueueView({
  tickets,
  loading,
  error,
  status,
  setStatus,
  category,
  setCategory,
  priority,
  setPriority,
  search,
  setSearch,
  onSearchKeyDown,
  onSearchClick,
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1>
        <p className="text-gray-500 mt-1">Manage, triage, and respond to incoming author queries</p>
      </div>

      {/* Filters Toolbar */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field w-auto text-sm py-1.5"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search subject, description, ticket #…"
                className="input-field pl-9 text-sm py-1.5"
              />
            </div>
            <button
              onClick={onSearchClick}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Loading */}
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
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tickets match your filters.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
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
                    t.isCritical ? 'bg-red-50/30 border-l-4 border-l-red-500' : ''
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
                    <div className="font-semibold">{t.author?.name || 'Unknown'}</div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[120px]">
                      {t.author?.email}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">
                    {t.book ? t.book.title : <span className="text-gray-400">General</span>}
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
                    {t.assignedTo ? (
                      <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                        👤 {t.assignedTo.name}
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
