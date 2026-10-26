import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { formatTicketNumber, formatRelativeTime } from '../../utils/formatters';

function processDetailTicket(t) {
  if (!t) return null;
  const responses = (t.responses || []).map((resp) => ({
    id: resp.id,
    authorName: resp.user?.name || 'BookLeaf Support Team',
    content: resp.content,
    formattedTime: formatRelativeTime(resp.createdAt),
  }));

  return {
    id: t.id,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    attachment: t.attachment,
    hasAttachment: Boolean(t.attachment),
    bookTitle: t.book ? t.book.title : null,
    bookIsbn: t.book?.isbn || null,
    hasBookInfo: Boolean(t.book),
    formattedTicketNumber: formatTicketNumber(t),
    formattedRelativeTime: formatRelativeTime(t.createdAt),
    responses,
    hasResponses: responses.length > 0,
  };
}

/**
 * Pure Functional Controller: Author Ticket Detail Synchronization.
 */
export function useAuthorTicketDetailFunction() {
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
