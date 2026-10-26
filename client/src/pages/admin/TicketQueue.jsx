import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Loader2, AlertCircle, Search, Filter, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability' },
  { value: 'BOOK_STATUS_PRODUCTION', label: 'Book Status & Production Updates' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];
const PRIORITY_OPTIONS = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function TicketQueue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const fetchTickets = () => {
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (search.trim()) filters.search = search.trim();

    setLoading(true);
    getAdminTickets(filters)
      .then((data) => {
        let list = data.tickets || [];
        // Sort: critical first, then oldest first
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        list.sort((a, b) => {
          const pA = priorityOrder[a.priority] ?? 4;
          const pB = priorityOrder[b.priority] ?? 4;
          if (pA !== pB) return pA - pB;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setTickets(list);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [status, category, priority]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search with enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchTickets();
  };

  // Real-time: new tickets
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data) => {
      toast.success('New ticket submitted!');
      fetchTickets();
    };

    const handleUpdated = () => fetchTickets();

    socket.on('ticket:created', handleCreated);
    socket.on('ticket:updated', handleUpdated);

    return () => {
      socket.off('ticket:created', handleCreated);
      socket.off('ticket:updated', handleUpdated);
    };
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOldUnresolved = (ticket) => {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') return false;
    const created = new Date(ticket.createdAt);
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 3;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1>
        <p className="text-gray-500 mt-1">Manage and respond to author support tickets</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
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

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tickets…"
                className="input-field pl-9 text-sm py-1.5"
              />
            </div>
          </div>

          <button onClick={fetchTickets} className="btn-primary text-sm py-1.5">
            Apply
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tickets match your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4">Ticket #</th>
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Author</th>
                  <th className="pb-3 pr-4">Book</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Priority</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Created</th>
                  <th className="pb-3">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const ticketNum = ticket.ticketNumber || ticket.ticketNo || `TKT-${String(ticket.id).padStart(4, '0')}`;
                  const isCritical = ticket.priority === 'CRITICAL';
                  const old = isOldUnresolved(ticket);
                  return (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        isCritical ? 'border-l-4 border-l-red-500' : old ? 'border-l-4 border-l-amber-400' : ''
                      }`}
                      onClick={() => window.location.href = `/admin/tickets/${ticket.id}`}
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500">{ticketNum}</td>
                      <td className="py-3 pr-4">
                        <Link to={`/admin/tickets/${ticket.id}`} className="font-medium text-gray-900 hover:text-emerald-700">
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{ticket.author?.name || ticket.user?.name || '—'}</td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">{ticket.book?.title || 'General'}</td>
                      <td className="py-3 pr-4"><CategoryBadge category={ticket.category} /></td>
                      <td className="py-3 pr-4"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={ticket.status} /></td>
                      <td className="py-3 pr-4 text-xs text-gray-500">
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : ''}
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {ticket.assignedTo?.name || ticket.assignee?.name || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {tickets.map((ticket) => {
              const ticketNum = ticket.ticketNumber || ticket.ticketNo || `TKT-${String(ticket.id).padStart(4, '0')}`;
              const isCritical = ticket.priority === 'CRITICAL';
              return (
                <Link
                  key={ticket.id}
                  to={`/admin/tickets/${ticket.id}`}
                  className={`card block hover:border-emerald-200 hover:shadow-md transition-all ${
                    isCritical ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{ticketNum}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                    <span className="text-gray-400">{ticket.author?.name || ticket.user?.name || ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
