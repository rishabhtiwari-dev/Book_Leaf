import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, ArrowLeft, BookOpen, Paperclip, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Pure presentation / design component for Author Ticket Detail view.
 */
export function AuthorTicketDetailView({ ticket, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Ticket not found'}</span>
        </div>
      </div>
    );
  }

  const ticketNumber =
    ticket.ticketNumber || ticket.ticketNo || `TKT-${String(ticket.id).padStart(4, '0')}`;

  return (
    <div>
      {/* Back link */}
      <Link
        to="/author/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Tickets
      </Link>

      {/* Ticket Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-400 font-semibold">{ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Submitted{' '}
              {ticket.createdAt
                ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                : ''}
            </p>
          </div>
        </div>

        {/* Book info */}
        {ticket.book && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Related Book:</span>
              <span className="font-medium text-gray-800">{ticket.book.title}</span>
              {ticket.book.isbn && (
                <span className="text-xs text-gray-400 font-mono">({ticket.book.isbn})</span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Attachment */}
        {ticket.attachment && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
            <Paperclip className="h-4 w-4" />
            <span className="font-mono text-xs">{ticket.attachment}</span>
          </div>
        )}
      </div>

      {/* Responses Timeline */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Responses from Support Team</h2>
      </div>

      {!ticket.responses || ticket.responses.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 text-sm">
            No responses yet. Our team will get back to you shortly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticket.responses.map((resp, idx) => (
            <div
              key={resp.id || idx}
              className="card border-l-4 border-l-emerald-500 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full">
                  <User className="h-3.5 w-3.5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {resp.user?.name || 'BookLeaf Support Team'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {resp.createdAt
                      ? formatDistanceToNow(new Date(resp.createdAt), { addSuffix: true })
                      : ''}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed pl-9">
                {resp.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
