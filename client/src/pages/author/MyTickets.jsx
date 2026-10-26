import React from 'react';
import { useMyTickets } from './useMyTickets';
import { MyTicketsView } from './MyTicketsView';

/**
 * MyTickets Page Container.
 * Binds functional ticket query and real-time updates from useMyTickets to presentation in MyTicketsView.
 */
export default function MyTickets() {
  const { tickets, loading, error } = useMyTickets();

  return <MyTicketsView tickets={tickets} loading={loading} error={error} />;
}
