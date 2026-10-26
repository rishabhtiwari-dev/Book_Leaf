import React from 'react';
import { Link } from 'react-router-dom';
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from '../../components/Badges';
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
  Save,
} from 'lucide-react';
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './useAdminTicketDetail';

/**
 * Pure Visual Design Component: Operations Admin Ticket Detail & Triage Layout.
 */
export function AdminTicketDetailView({
  ticket,
  loading,
  error,
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
  onSaveChanges,
  onAssignToMe,
  onGenerateAiDraft,
  onSendResponse,
  onAddNote,
}) {
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
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Ticket not found'}</span>
        </div>
      </div>
    );
  }

  const responses = ticket.formattedResponses || [];
  const notes = ticket.formattedNotes || [];
  const authorInfo = ticket.author;
  const bookInfo = ticket.formattedBook;

  return (
    <div>
      {/* Back link */}
      <Link
        to="/admin/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ticket Queue
      </Link>

      {/* Grid: 2 cols on desktop */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left / Main Content (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-400 font-bold">
                    {ticket.formattedTicketNumber}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <CategoryBadge category={ticket.category} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {ticket.formattedDate}
                </p>
              </div>
            </div>

            {/* Author info */}
            {authorInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                    <User className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{authorInfo.name}</p>
                    <p className="text-xs text-gray-500">{authorInfo.email}</p>
                    {authorInfo.city && (
                      <p className="text-xs text-gray-400">City: {authorInfo.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Book info */}
            {bookInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Related Book</span>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Title:</span>{' '}
                    <span className="font-semibold text-gray-900">{bookInfo.title}</span>
                  </p>
                  {bookInfo.isbn && (
                    <p>
                      <span className="text-gray-500">ISBN:</span>{' '}
                      <span className="font-mono text-xs text-gray-700">{bookInfo.isbn}</span>
                    </p>
                  )}
                  {bookInfo.status && (
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className="text-gray-700">{bookInfo.status}</span>
                    </p>
                  )}
                  {bookInfo.formattedRoyaltyEarned && (
                    <p>
                      <span className="text-gray-500">Total Royalty Earned:</span>{' '}
                      <span className="text-gray-700 font-medium">{bookInfo.formattedRoyaltyEarned}</span>
                    </p>
                  )}
                  {bookInfo.formattedRoyaltyPending && (
                    <p>
                      <span className="text-gray-500">Royalty Pending:</span>{' '}
                      <span className="text-amber-700 font-semibold">{bookInfo.formattedRoyaltyPending}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Original Query</h3>
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-gray-50/60 p-3 rounded-lg border border-gray-100">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Response Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Official Responses</h2>
            {responses.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400 text-sm">No responses sent to author yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((resp, idx) => (
                  <div
                    key={resp.id || idx}
                    className="card border-l-4 border-l-emerald-500 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full">
                        <User className="h-3.5 w-3.5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {resp.user?.name || 'Support Team'}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {resp.formattedDate}
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
          {/* Status / Category / Priority Management */}
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
                    <span className="ml-2 text-[10px] font-normal text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
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
                    <span className="ml-2 text-[10px] font-normal text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                      AI suggested: {ticket.aiPriority}
                    </span>
                  )}
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="input-field text-sm"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Save / Assign buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onSaveChanges}
                  disabled={saving}
                  className="btn-primary flex items-center gap-1.5 text-xs flex-1 justify-center"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </button>
                {!ticket.isAssignedToCurrent && (
                  <button
                    onClick={onAssignToMe}
                    className="btn-secondary flex items-center gap-1.5 text-xs"
                    title="Assign to yourself"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Assign to Me
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Response composer */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Send Response
              </h3>
              <button
                onClick={onGenerateAiDraft}
                disabled={generatingDraft}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg transition-colors border border-violet-200"
                title="Generate an AI draft response based on BookLeaf policies"
              >
                {generatingDraft ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                )}
                Generate AI Draft
              </button>
            </div>

            {isAiDraft && (
              <div className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg mb-2 border border-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Draft loaded — review and customize before sending</span>
              </div>
            )}

            <textarea
              rows={6}
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Type your response to the author, or generate an AI draft above…"
              className="input-field text-sm resize-y mb-3"
            />

            <button
              onClick={onSendResponse}
              disabled={sendingResponse || !responseContent.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {sendingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sendingResponse ? 'Sending…' : 'Send to Author'}
            </button>
          </div>

          {/* Internal Notes */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Internal Notes
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium ml-auto">
                Not visible to author
              </span>
            </div>

            {/* Existing notes */}
            {notes.length > 0 && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {notes.map((n, idx) => (
                  <div key={n.id || idx} className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                    <p className="whitespace-pre-wrap">{n.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-amber-600 mt-1.5 pt-1 border-t border-amber-200/50">
                      <span>{n.user?.name || 'Staff'}</span>
                      <span>{n.formattedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div className="space-y-2">
              <textarea
                rows={2}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add private note for the team…"
                className="input-field text-xs resize-y"
              />
              <button
                onClick={onAddNote}
                disabled={addingNote || !noteContent.trim()}
                className="btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-1.5"
              >
                {addingNote ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <StickyNote className="h-3.5 w-3.5" />
                )}
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
