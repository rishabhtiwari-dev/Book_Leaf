import { useState, useEffect } from 'react';
import { getAdminTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { formatTicketNumber, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability' },
  { value: 'BOOK_STATUS_PRODUCTION', label: 'Book Status & Production Updates' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];

export const PRIORITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function processQueueTicket(t) {
  const responsesCount = t._count?.responses ?? 0;
  return {
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    authorName: t.author?.name || 'Unknown',
    authorEmail: t.author?.email || '',
    bookTitle: t.book ? t.book.title : 'General Account',
    assignedToName: t.assignedTo ? t.assignedTo.name : null,
    formattedTicketNumber: formatTicketNumber(t),
    formattedDate: formatDate(t.createdAt, 'MMM d, h:mm a'),
    responsesText:
      responsesCount > 0
        ? `${responsesCount} response${responsesCount > 1 ? 's' : ''}`
        : null,
    isCritical: t.priority === 'CRITICAL',
  };
}

/**
 * Pure Functional Controller: Operations Queue Filtering, Sorting, and Handlers.
 */
export function useTicketQueueFunction() {
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
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        list.sort((a, b) => {
          const pA = priorityOrder[a.priority] ?? 4;
          const pB = priorityOrder[b.priority] ?? 4;
          if (pA !== pB) return pA - pB;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setTickets(list.map(processQueueTicket));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [status, category, priority]);

  // Real-time WebSocket subscriptions
  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => {
      toast.success('New ticket received in queue!');
      fetchTickets();
    };

    const handleUpdated = () => fetchTickets();

    socket.on('ticket:created', handleCreated);
    socket.on('ticket:updated', handleUpdated);

    return () => {
      socket.off('ticket:created', handleCreated);
      socket.off('ticket:updated', handleUpdated);
    };
  }, [socket]);

  // Change handler functions (NO inline arrow functions in design JSX)
  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handlePriorityChange = (e) => setPriority(e.target.value);
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchTickets();
  };
  const handleSearchSubmit = () => fetchTickets();

  return {
    tickets,
    hasTickets: tickets.length > 0,
    loading,
    error,
    status,
    category,
    priority,
    search,
    statusOptions: STATUS_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS,
    priorityOptions: PRIORITY_OPTIONS,
    onStatusChange: handleStatusChange,
    onCategoryChange: handleCategoryChange,
    onPriorityChange: handlePriorityChange,
    onSearchChange: handleSearchChange,
    onSearchKeyDown: handleSearchKeyDown,
    onSearchSubmit: handleSearchSubmit,
  };
}

