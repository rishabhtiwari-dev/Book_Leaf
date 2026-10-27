import { useState, useEffect } from 'react';
import { getBooks } from '../../api/client';
import { formatCurrency, formatNumber } from '../../utils/formatters';

/**
 * Transforms raw book data into presentation-ready objects.
 */
function processBook(book) {
  const inProduction =
    book.status?.toLowerCase().includes('in production') ||
    book.status === 'IN_PRODUCTION' ||
    book.status === 'DRAFT' ||
    book.mrp == null;

  const totalCopiesSold = book.totalCopiesSold ?? 0;
  const totalRoyaltyEarned = book.totalRoyaltyEarned ?? 0;
  const royaltyPaid = book.royaltyPaid ?? 0;
  const calculatedPending =
    book.royaltyPending != null ? book.royaltyPending : totalRoyaltyEarned - royaltyPaid;

  const platforms = Array.isArray(book.availableOn)
    ? book.availableOn
    : Array.isArray(book.platforms)
    ? book.platforms
    : [];

  return {
    id: book.id,
    bookId: book.bookId,
    title: book.title,
    isbn: book.isbn || '—',
    genre: book.genre || '—',
    inProduction,
    statusLabel: book.status || (inProduction ? 'In Production' : 'Published & Live'),
    displayMrp: inProduction ? '—' : formatCurrency(book.mrp),
    displayCopiesSold: inProduction ? '—' : formatNumber(totalCopiesSold),
    displayRoyaltyEarned: inProduction ? '—' : formatCurrency(totalRoyaltyEarned),
    displayRoyaltyPaid: inProduction ? '—' : formatCurrency(royaltyPaid),
    displayRoyaltyPending: inProduction ? '—' : formatCurrency(calculatedPending),
    platforms,
  };
}

/**
 * Pure Functional Controller: Author Catalog Data Fetching.
 */
export function useMyBooksFunction() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooks = () => {
    setLoading(true);
    getBooks()
      .then((data) => {
        const rawBooks = data.books || [];
        setBooks(rawBooks.map(processBook));
      })
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

