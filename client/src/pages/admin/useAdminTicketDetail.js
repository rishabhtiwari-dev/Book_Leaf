import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAdminTicket,
  updateTicket,
  sendResponse,
  addNote,
  generateAiDraft,
} from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const CATEGORY_OPTIONS = [
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability' },
  { value: 'BOOK_STATUS_PRODUCTION', label: 'Book Status & Production Updates' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];
export const PRIORITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Custom hook managing operations ticket detail, AI draft generation,
 * status/category/priority overrides, responses, and internal notes.
 */
export function useAdminTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit fields
  const [editStatus, setEditStatus] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [saving, setSaving] = useState(false);

  // Response composer
  const [responseContent, setResponseContent] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [isAiDraft, setIsAiDraft] = useState(false);

  // AI Draft generator
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Internal Notes
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchTicket = () => {
    getAdminTicket(id)
      .then((data) => {
        const t = data.ticket;
        setTicket(t);
        setEditStatus(t.status || 'OPEN');
        setEditCategory(t.category || '');
        setEditPriority(t.priority || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket || !ticket) return;

    const handleUpdated = (data) => {
      if (data.id === ticket.id || data.ticketId === ticket.id) {
        fetchTicket();
      }
    };
    const handleResponse = (data) => {
      if (data.ticketId === ticket.id || data.id === ticket.id) {
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

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (editStatus !== ticket.status) updates.status = editStatus;
      if (editCategory !== ticket.category) updates.category = editCategory;
      if (editPriority !== ticket.priority) updates.priority = editPriority;

      if (Object.keys(updates).length === 0) {
        toast('No changes to save');
        setSaving(false);
        return;
      }
      await updateTicket(id, updates);
      toast.success('Ticket updated successfully');
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await updateTicket(id, { assignedToId: user.id });
      toast.success('Ticket assigned to you');
      fetchTicket();
    } catch (err) {
      toast.error('Failed to assign ticket');
    }
  };

  const handleGenerateAiDraft = async () => {
    setGeneratingDraft(true);
    try {
      const data = await generateAiDraft(id);
      setResponseContent(data.draft || '');
      setIsAiDraft(true);
      toast.success('AI draft generated based on BookLeaf policies');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseContent.trim()) {
      toast.error('Response cannot be empty');
      return;
    }
    setSendingResponse(true);
    try {
      await sendResponse(id, responseContent.trim());
      setResponseContent('');
      setIsAiDraft(false);
      toast.success('Response sent to author');
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    setAddingNote(true);
    try {
      await addNote(id, noteContent.trim());
      setNoteContent('');
      toast.success('Internal note added');
      fetchTicket();
    } catch (err) {
      toast.error('Failed to add internal note');
    } finally {
      setAddingNote(false);
    }
  };

  return {
    ticket,
    loading,
    error,
    user,
    editStatus,
    setEditStatus,
    editCategory,
    setEditCategory,
    editPriority,
    setEditPriority,
    saving,
    responseContent,
    setResponseContent,
    sendingResponse,
    isAiDraft,
    generatingDraft,
    noteContent,
    setNoteContent,
    addingNote,
    handleSaveChanges,
    handleAssignToMe,
    handleGenerateAiDraft,
    handleSendResponse,
    handleAddNote,
  };
}
