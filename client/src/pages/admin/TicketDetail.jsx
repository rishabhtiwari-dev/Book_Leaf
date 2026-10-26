import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAdminTicket,
  updateTicket,
  sendResponse,
  addNote,
  generateAiDraft,
} from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge, formatCurrency } from '../../components/Badges';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  User,
  Send,
  Sparkles,
  StickyNote,
  UserCheck,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const CATEGORY_OPTIONS = [
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability' },
  { value: 'BOOK_STATUS_PRODUCTION', label: 'Book Status & Production Updates' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];
const PRIORITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function AdminTicketDetail() {
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

  // Response
  const [responseContent, setResponseContent] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [isAiDraft, setIsAiDraft] = useState(false);

  // AI Draft
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Notes
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
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time updates
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
  }, [socket, ticket?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
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
      toast.success('Ticket updated');
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
      toast.success('AI draft generated');
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
      toast.success('Response sent');
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
      toast.success('Note added');
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Ticket not found'}</span>
        </div>
      </div>
    );
  }

  const ticketNumber = ticket.ticketNumber || ticket.ticketNo || `TKT-${String(ticket.id).padStart(4, '0')}`;
  const authorInfo = ticket.author || ticket.user;
  const responses = ticket.responses || [];
  const notes = ticket.notes || [];

  return (
    <div>
      {/* Back */}
      <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Ticket Queue
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left Panel (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <div className="card">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-400">{ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{ticket.subject}</h1>
            <p className="text-sm text-gray-500">
              Submitted {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : ''}
            </p>

            {/* Author info */}
            {authorInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-emerald-100 rounded-full">
                    <User className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{authorInfo.name}</p>
                    <p className="text-xs text-gray-500">{authorInfo.email}</p>
                    {authorInfo.city && (
                      <p className="text-xs text-gray-400">{authorInfo.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Book info */}
            {ticket.book && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Related Book</span>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
                  <p><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{ticket.book.title}</span></p>
                  {ticket.book.isbn && <p><span className="text-gray-500">ISBN:</span> <span className="font-mono text-xs text-gray-700">{ticket.book.isbn}</span></p>}
                  {ticket.book.status && <p><span className="text-gray-500">Status:</span> <span className="text-gray-700">{ticket.book.status.replace(/_/g, ' ')}</span></p>}
                  {ticket.book.totalRoyaltyEarned != null && (
                    <p><span className="text-gray-500">Royalty Earned:</span> <span className="text-gray-700">{formatCurrency(ticket.book.totalRoyaltyEarned)}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Response Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Responses</h2>
            {responses.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400 text-sm">No responses yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((resp, idx) => (
                  <div
                    key={resp.id || idx}
                    className="card border-l-4 border-l-emerald-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full">
                        <User className="h-3.5 w-3.5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {resp.user?.name || resp.admin?.name || 'Support Team'}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {resp.createdAt ? format(new Date(resp.createdAt), 'MMM d, yyyy h:mm a') : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed pl-9">
                      {resp.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel (1 col) ── */}
        <div className="space-y-6">
          {/* Status / Category / Priority */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Manage Ticket
            </h3>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="input-field text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Category
                  {ticket.aiCategory && (
                    <span className="ml-2 text-[10px] font-normal text-violet-500">
                      AI suggested: {ticket.aiCategory}
                    </span>
                  )}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Select…</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Priority
                  {ticket.aiPriority && (
                    <span className="ml-2 text-[10px] font-normal text-violet-500">
                      AI suggested: {ticket.aiPriority}
                    </span>
                  )}
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Select…</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>

              {/* Save changes */}
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

              {/* Assign to me */}
              <button
                onClick={handleAssignToMe}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <UserCheck className="h-4 w-4" />
                Assign to Me
              </button>
            </div>
          </div>

          {/* Response composer */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Send Response
            </h3>

            {/* AI Draft button */}
            <button
              onClick={handleGenerateAiDraft}
              disabled={generatingDraft}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mb-3"
            >
              {generatingDraft ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-violet-500" />
              )}
              {generatingDraft ? 'Generating…' : 'Generate AI Draft'}
            </button>

            {isAiDraft && (
              <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg mb-2">
                <Sparkles className="h-3 w-3" />
                AI Draft — Review and edit before sending
              </div>
            )}

            <textarea
              rows={5}
              value={responseContent}
              onChange={(e) => {
                setResponseContent(e.target.value);
                if (isAiDraft) setIsAiDraft(false);
              }}
              placeholder="Type your response to the author…"
              className="input-field resize-y text-sm mb-3"
            />

            <button
              onClick={handleSendResponse}
              disabled={sendingResponse || !responseContent.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {sendingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sendingResponse ? 'Sending…' : 'Send Response'}
            </button>
          </div>

          {/* Internal Notes */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Internal Notes
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <EyeOff className="h-2.5 w-2.5" />
                Not visible to author
              </span>
            </div>

            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add an internal note…"
              className="input-field resize-y text-sm mb-3"
            />

            <button
              onClick={handleAddNote}
              disabled={addingNote || !noteContent.trim()}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mb-4"
            >
              {addingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StickyNote className="h-4 w-4" />
              )}
              {addingNote ? 'Adding…' : 'Add Note'}
            </button>

            {/* Existing notes */}
            {notes.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-3">
                {notes.map((note, idx) => (
                  <div key={note.id || idx} className="bg-amber-50/50 rounded-lg px-3 py-2.5 text-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {note.user?.name || note.admin?.name || 'Admin'} ·{' '}
                      {note.createdAt ? format(new Date(note.createdAt), 'MMM d, yyyy h:mm a') : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
