import React from 'react';
import { useMyBooksFunction } from './myBooks.function';
import { MyBooksDesign } from './myBooks.design';

/**
 * Author MyBooks Page Container.
 * Connects pure functional logic (myBooks.function.js) to pure visual presentation (myBooks.design.jsx).
 */
export default function MyBooks() {
  const stateAndData = useMyBooksFunction();
  return <MyBooksDesign {...stateAndData} />;
}
