import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, Ticket, PlusCircle } from 'lucide-react';
import './myTickets.design.css';

/**
 * Pure Visual Design Component: Author My Tickets Feed Layout.
 * 0 inline calculations, 0 state logic.
 */
export function MyTicketsDesign({ tickets, hasTickets, loading, error }) {
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
    <div className="author-tickets-container">
      <div className="author-tickets-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 mt-1">Track your support queries and responses in real-time</p>
        </div>
        <Link to="/author/tickets/new" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {!hasTickets ? (
        <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No tickets yet. Submit your first support query.</p>
          <Link to="/author/tickets/new" className="btn-primary inline-flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4" />
            Submit Ticket
          </Link>
        </div>
      ) : (
        <div className="author-tickets-list">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/author/tickets/${ticket.id}`}
              className="card author-ticket-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400 font-bold">
                      {ticket.formattedTicketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                    {ticket.bookTitle ? (
                      <span className="text-xs text-gray-500">📖 {ticket.bookTitle}</span>
                    ) : (
                      <span className="text-xs text-gray-400">General Account</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {ticket.formattedDate}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTicketsDesign;

