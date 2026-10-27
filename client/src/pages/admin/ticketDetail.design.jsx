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
import './ticketDetail.design.css';

/**
 * Pure Visual Design Component: Operations Admin Ticket Detail & Triage Layout.
 * 
 * DESIGN SPECIFICATION:
 * - 0 inline state calculations
 * - 0 date formatters or string mutations
 * - 0 inline arrow functions
 * - All data and handlers are provided by ticketDetail.function.js
 */
export function TicketDetailDesign({
  ticket,
  loading,
  error,
  statusOptions,
  categoryOptions,
  priorityOptions,
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
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onResponseContentChange,
  onNoteContentChange,
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

  return (
    <div className="admin-ticket-container">
      {/* Back to Queue Navigation */}
      <Link to="/admin/tickets" className="admin-ticket-back-link">
        <ArrowLeft className="h-4 w-4" />
        Back to Ticket Queue
      </Link>

      <div className="admin-ticket-grid">
        {/* ── Left / Main Content ── */}
        <div className="admin-main-panel">
          {/* Header Card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-400 font-bold">
                    {ticket.ticketNumber}
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
            {ticket.authorInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                    <User className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ticket.authorInfo.name}</p>
                    <p className="text-xs text-gray-500">{ticket.authorInfo.email}</p>
                    {ticket.authorInfo.city && (
                      <p className="text-xs text-gray-400">City: {ticket.authorInfo.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Book info */}
            {ticket.bookInfo && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">Related Book</span>
                </div>
                <div className="admin-book-details-box">
                  <p>
                    <span className="text-gray-500">Title:</span>{' '}
                    <span className="font-semibold text-gray-900">{ticket.bookInfo.title}</span>
                  </p>
                  {ticket.bookInfo.isbn && (
                    <p>
                      <span className="text-gray-500">ISBN:</span>{' '}
                      <span className="font-mono text-xs text-gray-700">{ticket.bookInfo.isbn}</span>
                    </p>
                  )}
                  {ticket.bookInfo.status && (
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className="text-gray-700">{ticket.bookInfo.status}</span>
                    </p>
                  )}
                  {ticket.bookInfo.formattedRoyaltyEarned && (
                    <p>
                      <span className="text-gray-500">Total Royalty Earned:</span>{' '}
                      <span className="text-gray-700 font-medium">{ticket.bookInfo.formattedRoyaltyEarned}</span>
                    </p>
                  )}
                  {ticket.bookInfo.formattedRoyaltyPending && (
                    <p>
                      <span className="text-gray-500">Royalty Pending:</span>{' '}
                      <span className="text-amber-700 font-semibold">{ticket.bookInfo.formattedRoyaltyPending}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Original Query</h3>
              <p className="admin-query-description">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Response Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Official Responses</h2>
            {!ticket.hasResponses ? (
              <div className="card text-center py-8">
                <p className="text-gray-400 text-sm">No responses sent to author yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.responses.map((resp) => (
                  <div key={resp.id} className="admin-response-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full">
                        <User className="h-3.5 w-3.5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {resp.authorName}
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

        {/* ── Right / Action Panel ── */}
        <div className="admin-side-panel">
          {/* Status & Priority Triage Card */}
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
                  onChange={onStatusChange}
                  className="input-field text-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                  onChange={onCategoryChange}
                  className="input-field text-sm"
                >
                  <option value="">Select…</option>
                  {categoryOptions.map((c) => (
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
                  onChange={onPriorityChange}
                  className="input-field text-sm"
                >
                  {priorityOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
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

          {/* AI Response Composer Card */}
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
              <div className="admin-ai-badge">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Draft loaded — review and customize before sending</span>
              </div>
            )}

            <textarea
              rows={6}
              value={responseContent}
              onChange={onResponseContentChange}
              placeholder="Type your response to the author, or generate an AI draft above…"
              className="input-field text-sm resize-y mb-3"
            />

            <button
              onClick={onSendResponse}
              disabled={sendingResponse || !canSendResponse}
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

          {/* Internal Notes Card */}
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
            {ticket.hasNotes && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {ticket.notes.map((n) => (
                  <div key={n.id} className="admin-note-item">
                    <p className="whitespace-pre-wrap">{n.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-amber-600 mt-1.5 pt-1 border-t border-amber-200/50">
                      <span>{n.authorName}</span>
                      <span>{n.formattedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note textarea */}
            <div className="space-y-2">
              <textarea
                rows={2}
                value={noteContent}
                onChange={onNoteContentChange}
                placeholder="Add private note for the team…"
                className="input-field text-xs resize-y"
              />
              <button
                onClick={onAddNote}
                disabled={addingNote || !canAddNote}
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

export default TicketDetailDesign;

