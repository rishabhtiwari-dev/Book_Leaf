import React from 'react';
import { useAuthorTicketDetailFunction } from './ticketDetail.function';
import { TicketDetailDesign } from './ticketDetail.design';

/**
 * Author TicketDetail Page Container.
 * Connects pure functional logic (ticketDetail.function.js) to pure visual presentation (ticketDetail.design.jsx).
 */
export default function TicketDetail() {
  const { ticket, loading, error } = useAuthorTicketDetailFunction();
  return <TicketDetailDesign ticket={ticket} loading={loading} error={error} />;
}
