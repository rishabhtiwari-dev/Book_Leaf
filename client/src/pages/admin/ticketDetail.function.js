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
import { formatTicketNumber, formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const CATEGORY_OPTIONS = [
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

/**
 * Pure data transformation: converts raw ticket model to formatted presentation view model.
 */
function processAdminTicket(t, currentUserId) {
  if (!t) return null;

  const responses = (t.responses || []).map((resp) => ({
    id: resp.id,
    authorName: resp.user?.name || 'BookLeaf Support Team',
    content: resp.content,
    formattedDate: formatDate(resp.createdAt, 'MMM d, yyyy h:mm a'),
  }));

  const notes = (t.internalNotes || []).map((n) => ({
    id: n.id,
    authorName: n.user?.name || 'Staff',
    content: n.content,
    formattedDate: formatDate(n.createdAt, 'MMM d, h:mm a'),
  }));

  const bookInfo = t.book
    ? {
        title: t.book.title,
        isbn: t.book.isbn,
        status: t.book.status,
        formattedRoyaltyEarned: formatCurrency(t.book.totalRoyaltyEarned),
        formattedRoyaltyPending: formatCurrency(t.book.royaltyPending),
      }
    : null;

  const authorInfo = t.author
    ? {
        name: t.author.name,
        email: t.author.email,
        city: t.author.city,
      }
    : null;

  return {
    id: t.id,
    ticketNumber: formatTicketNumber(t),
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    aiCategory: t.aiCategory,
    aiPriority: t.aiPriority,
    formattedDate: formatDate(t.createdAt, 'MMM d, yyyy h:mm a'),
    responses,
    hasResponses: responses.length > 0,
    notes,
    hasNotes: notes.length > 0,
    bookInfo,
    authorInfo,
    isAssignedToCurrent: t.assignedToId === currentUserId,
  };
}

/**
 * Pure Functional Controller: Operations Admin Ticket Detail Logic.
 * Contains ALL state management, API calls, socket subscriptions, calculations, and event handlers.
 */
export function useAdminTicketDetailFunction() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown states
  const [editStatus, setEditStatus] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [saving, setSaving] = useState(false);

  // Response composer states
  const [responseContent, setResponseContent] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [isAiDraft, setIsAiDraft] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Note composer states
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchTicket = () => {
    getAdminTicket(id)
      .then((data) => {
        const raw = data.ticket;
        const processed = processAdminTicket(raw, user?.id);
        setTicket(processed);
        setEditStatus(raw.status || 'OPEN');
        setEditCategory(raw.category || '');
        setEditPriority(raw.priority || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id, user?.id]);

  // Socket updates
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

  // Input change event handlers
  const handleStatusChange = (e) => setEditStatus(e.target.value);
  const handleCategoryChange = (e) => setEditCategory(e.target.value);
  const handlePriorityChange = (e) => setEditPriority(e.target.value);
  const handleResponseContentChange = (e) => setResponseContent(e.target.value);
  const handleNoteContentChange = (e) => setNoteContent(e.target.value);

  // Computed readiness flags (ZERO string calculations in the design file)
  const canSendResponse = Boolean(responseContent && responseContent.trim().length > 0);
  const canAddNote = Boolean(noteContent && noteContent.trim().length > 0);

  // Action mutations
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
    if (!canSendResponse) {
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
    if (!canAddNote) {
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
    statusOptions: STATUS_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS,
    priorityOptions: PRIORITY_OPTIONS,
    editStatus,
    editCategory,
    editPriority,
    saving,
    responseContent,
    sendingResponse,
    canSendResponse,
    isAiDraft,
    generatingDraft,
    noteContent,
    addingNote,
    canAddNote,
    onStatusChange: handleStatusChange,
    onCategoryChange: handleCategoryChange,
    onPriorityChange: handlePriorityChange,
    onResponseContentChange: handleResponseContentChange,
    onNoteContentChange: handleNoteContentChange,
    onSaveChanges: handleSaveChanges,
    onAssignToMe: handleAssignToMe,
    onGenerateAiDraft: handleGenerateAiDraft,
    onSendResponse: handleSendResponse,
    onAddNote: handleAddNote,
  };
}
