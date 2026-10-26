import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket } from '../../api/client';
import { useSocket } from '../../context/SocketContext';

/**
 * Custom hook managing individual ticket view data and real-time response synchronization for author.
 */
export function useAuthorTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchTicket = () => {
    getTicket(id)
      .then((data) => setTicket(data.ticket))
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
