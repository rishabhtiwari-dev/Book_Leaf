import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, Ticket, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  useEffect(() => {
    getTickets()
      .then((data) => setTickets(data.tickets || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (data) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === data.id || t.id === data.ticketId ? { ...t, ...data } : t))
      );
      const num = data.ticketNumber || data.ticketNo || '';
      toast.success(`Ticket ${num} has been updated`);
    };

    const handleResponse = (data) => {
      const num = data.ticketNumber || data.ticketNo || '';
      toast.success(`Your ticket ${num} has a new response!`);
      // Refresh to get latest data
      getTickets().then((d) => setTickets(d.tickets || [])).catch(() => {});
    };

    socket.on('ticket:updated', handleUpdated);
    socket.on('ticket:response', handleResponse);

    return () => {
      socket.off('ticket:updated', handleUpdated);
      socket.off('ticket:response', handleResponse);
    };
  }, [socket]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 mt-1">Track your support queries and responses</p>
        </div>
        <Link to="/author/tickets/new" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No tickets yet. Submit your first support query.</p>
          <Link to="/author/tickets/new" className="btn-primary inline-flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4" />
            Submit Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/author/tickets/${ticket.id}`}
              className="card block hover:border-emerald-200 hover:shadow-md transition-all duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      {ticket.ticketNumber || ticket.ticketNo || `TKT-${String(ticket.id).padStart(4, '0')}`}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                    {ticket.book ? (
                      <span className="text-xs text-gray-500">📖 {ticket.book.title}</span>
                    ) : (
                      <span className="text-xs text-gray-400">General</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {ticket.createdAt
                    ? format(new Date(ticket.createdAt), 'MMM d, yyyy')
                    : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
