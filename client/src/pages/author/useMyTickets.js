import { useState, useEffect } from 'react';
import { getTickets } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

/**
 * Custom hook managing ticket list fetching and real-time WebSocket subscriptions for authors.
 */
export function useMyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchTickets = () => {
    getTickets()
      .then((data) => setTickets(data.tickets || []))
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
        prev.map((t) => (t.id === data.id || t.id === data.ticketId ? { ...t, ...data } : t))
      );
      const num = data.ticketNumber || data.ticketNo || '';
      toast.success(`Ticket ${num} has been updated`);
    };

    const handleResponse = (data) => {
      const num = data.ticketNumber || data.ticketNo || '';
      toast.success(`Your ticket ${num} has a new response!`);
      // Refresh to get latest data with new response
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
    loading,
    error,
    refreshTickets: fetchTickets,
  };
}
