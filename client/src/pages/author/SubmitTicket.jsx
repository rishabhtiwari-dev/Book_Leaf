import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, createTicket } from '../../api/client';
import { Loader2, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookId, setBookId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    getBooks()
      .then((data) => setBooks(data.books || []))
      .catch(() => {})
      .finally(() => setLoadingBooks(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!subject.trim()) errs.subject = 'Subject is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = { subject: subject.trim(), description: description.trim() };
      if (bookId) data.bookId = bookId;
      await createTicket(data);
      toast.success('Ticket submitted successfully!');
      navigate('/author/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Ticket</h1>
        <p className="text-gray-500 mt-1">Describe your issue or query and we'll get back to you</p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Book selector */}
          <div>
            <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
              Related Book
            </label>
            <select
              id="book"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="input-field"
              disabled={loadingBooks}
            >
              <option value="">General / Account Level</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.isbn ? `(${b.isbn})` : ''}
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
              onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: '' })); }}
              placeholder="Brief summary of your issue"
              className={`input-field ${errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
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
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
              placeholder="Provide details about your issue, including any relevant order numbers, dates, or specifics…"
              className={`input-field resize-y ${errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* File attachment (UI only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                />
              </label>
              {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
            </div>
          </div>

          {/* Submit */}
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
              onClick={() => navigate('/author/tickets')}
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
