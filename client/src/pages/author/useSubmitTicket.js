import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, createTicket } from '../../api/client';
import toast from 'react-hot-toast';

/**
 * Custom hook managing ticket submission form state, book options loading, validation, and submission.
 */
export function useSubmitTicket() {
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

  const handleSubjectChange = (val) => {
    setSubject(val);
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
  };

  const handleDescriptionChange = (val) => {
    setDescription(val);
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
    setBookId,
    subject,
    handleSubjectChange,
    description,
    handleDescriptionChange,
    fileName,
    handleFileChange,
    errors,
    handleSubmit,
    handleCancel,
  };
}

