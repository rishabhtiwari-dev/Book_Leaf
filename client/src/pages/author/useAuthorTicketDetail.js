import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { formatTicketNumber, formatRelativeTime } from '../../utils/formatters';

function processDetailTicket(t) {
  if (!t) return null;
  return {
    ...t,
    formattedTicketNumber: formatTicketNumber(t),
    formattedRelativeTime: formatRelativeTime(t.createdAt),
    responses: (t.responses || []).map((resp) => ({
      ...resp,
      formattedTime: formatRelativeTime(resp.createdAt),
    })),
  };
}

/**
 * Pure Functional Hook: Author Ticket Detail Fetching & Synchronization.
 */
export function useAuthorTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchTicket = () => {
    getTicket(id)
      .then((data) => setTicket(processDetailTicket(data.ticket)))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (data) => {
      if (data.id === ticket?.id || data.ticketId === ticket?.id) {
        fetchTicket();
      }
    };

    const handleResponse = (data) => {
      if (data.ticketId === ticket?.id || data.id === ticket?.id) {
        fetchTicket();
      }
    };

    socket.on('ticket:updated', handleUpdated);
    socket.on('ticket:response', handleResponse);

    return () => {
      socket.off('ticket:updated', handleUpdated);
      socket.off('ticket:response', handleResponse);
    };
  }, [socket, ticket?.id]);

  return {
    ticket,
    loading,
    error,
    refreshTicket: fetchTicket,
  };
}
