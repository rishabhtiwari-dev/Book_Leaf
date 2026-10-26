import React from 'react';
import { useMyTicketsFunction } from './myTickets.function';
import { MyTicketsDesign } from './myTickets.design';

/**
 * Author MyTickets Page Container.
 * Connects pure functional logic (myTickets.function.js) to pure visual presentation (myTickets.design.jsx).
 */
export default function MyTickets() {
  const stateAndData = useMyTicketsFunction();
  return <MyTicketsDesign {...stateAndData} />;
}
