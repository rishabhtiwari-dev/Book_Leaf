import { useState, useEffect } from 'react';
import { getBooks } from '../../api/client';

/**
 * Custom hook managing book catalog data fetching and status state for author.
 */
export function useMyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooks = () => {
    setLoading(true);
    getBooks()
      .then((data) => setBooks(data.books || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load books'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    refreshBooks: fetchBooks,
  };
}
