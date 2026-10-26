import React from 'react';
import { useMyBooks } from './useMyBooks';
import { MyBooksView } from './MyBooksView';

/**
 * MyBooks Page Container.
 * Binds functional catalog fetching from useMyBooks to presentation in MyBooksView.
 */
export default function MyBooks() {
  const { books, loading, error } = useMyBooks();

  return <MyBooksView books={books} loading={loading} error={error} />;
}
