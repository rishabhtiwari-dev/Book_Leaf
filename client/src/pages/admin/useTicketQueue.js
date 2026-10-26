import { useState, useEffect } from 'react';
import { getAdminTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability' },
  { value: 'BOOK_STATUS_PRODUCTION', label: 'Book Status & Production Updates' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];
export const PRIORITY_OPTIONS = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Custom hook managing operations ticket queue filtering, priority sorting, and real-time events.
 */
export function useTicketQueue() {
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
        // Sort: critical first, then oldest unresolved first
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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchTickets();
  };

  return {
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
    handleSearchKeyDown,
    triggerSearch: fetchTickets,
  };
}
