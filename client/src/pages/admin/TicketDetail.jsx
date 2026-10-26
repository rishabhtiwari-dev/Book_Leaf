import React from 'react';
import { useAdminTicketDetailFunction } from './ticketDetail.function';
import { TicketDetailDesign } from './ticketDetail.design';

/**
 * Operations Admin Ticket Detail Page Container.
 * Connects pure functional logic (ticketDetail.function.js) to pure visual presentation (ticketDetail.design.jsx).
 */
export default function TicketDetail() {
  const stateAndHandlers = useAdminTicketDetailFunction();
  return <TicketDetailDesign {...stateAndHandlers} />;
}
