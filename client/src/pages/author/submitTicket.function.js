import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, createTicket } from '../../api/client';
import toast from 'react-hot-toast';

/**
 * Pure Functional Controller: Ticket Submission State, Validation, and Mutation.
 */
export function useSubmitTicketFunction() {
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
      .then((data) => {
        const rawBooks = data.books || [];
        const formatted = rawBooks.map((b) => ({
          id: b.id,
          title: b.title,
          isbn: b.isbn,
          displayLabel: b.isbn ? `${b.title} (${b.isbn})` : b.title,
        }));
        setBooks(formatted);
      })
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

  const handleBookChange = (e) => setBookId(e.target.value);

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = {
        subject: subject.trim(),
        description: description.trim(),
      };
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

  const handleCancel = () => {
    navigate('/author/tickets');
  };

  return {
    books,
    loadingBooks,
    submitting,
    bookId,
    subject,
    description,
    fileName,
    errors,
    onBookChange: handleBookChange,
    onSubjectChange: handleSubjectChange,
    onDescriptionChange: handleDescriptionChange,
    onFileChange: handleFileChange,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };
}
