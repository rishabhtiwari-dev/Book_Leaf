import React from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import './submitTicket.design.css';

/**
 * Pure Visual Design Component: Author Ticket Submission Form.
 * 0 inline calculations, 0 state logic.
 */
export function SubmitTicketDesign({
  books,
  loadingBooks,
  submitting,
  bookId,
  subject,
  description,
  fileName,
  errors,
  onBookChange,
  onSubjectChange,
  onDescriptionChange,
  onFileChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="author-submit-container">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit a Ticket</h1>
        <p className="text-gray-500 mt-1">Describe your issue or query and our team will assist you</p>
      </div>

      <div className="card author-submit-card">
        <form onSubmit={onSubmit} className="author-submit-form">
          {/* Book selector */}
          <div>
            <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
              Related Book
            </label>
            <select
              id="book"
              value={bookId}
              onChange={onBookChange}
              className="input-field"
              disabled={loadingBooks}
            >
              <option value="">General / Account Level</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.displayLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={onSubjectChange}
              placeholder="Brief summary of your issue"
              className={`input-field ${
                errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={onDescriptionChange}
              placeholder="Provide details about your issue, including any relevant order numbers, dates, or specifics…"
              className={`input-field resize-y ${
                errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* File attachment (UI only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="author-attachment-row">
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4 text-gray-500" />
                Choose File
                <input type="file" className="hidden" onChange={onFileChange} />
              </label>
              {fileName && <span className="text-sm text-gray-600 font-mono">{fileName}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitTicketDesign;

