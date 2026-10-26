import { useState, useEffect } from 'react';
import { getTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { formatTicketNumber, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

function processTicket(t) {
  return {
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    bookTitle: t.book ? t.book.title : null,
    formattedTicketNumber: formatTicketNumber(t),
    formattedDate: formatDate(t.createdAt, 'MMM d, yyyy'),
  };
}

/**
 * Pure Functional Controller: Author Ticket List Fetching & WebSocket Events.
 */
export function useMyTicketsFunction() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchTickets = () => {
    getTickets()
      .then((data) => {
        const rawList = data.tickets || [];
        setTickets(rawList.map(processTicket));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (data) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === data.id || t.id === data.ticketId ? processTicket({ ...t, ...data }) : t
        )
      );
      const num = formatTicketNumber(data);
      toast.success(`Ticket ${num} has been updated`);
    };

    const handleResponse = (data) => {
      const num = formatTicketNumber(data);
      toast.success(`Your ticket ${num} has a new response!`);
      fetchTickets();
    };

    socket.on('ticket:updated', handleUpdated);
    socket.on('ticket:response', handleResponse);

    return () => {
      socket.off('ticket:updated', handleUpdated);
      socket.off('ticket:response', handleResponse);
    };
  }, [socket]);

  return {
    tickets,
    hasTickets: tickets.length > 0,
    loading,
    error,
    refreshTickets: fetchTickets,
  };
}
