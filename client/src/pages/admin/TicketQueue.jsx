import React from 'react';
import { useTicketQueueFunction } from './ticketQueue.function';
import { TicketQueueDesign } from './ticketQueue.design';

/**
 * Operations Admin TicketQueue Page Container.
 * Connects pure functional logic (ticketQueue.function.js) to pure visual presentation (ticketQueue.design.jsx).
 */
export default function TicketQueue() {
  const stateAndHandlers = useTicketQueueFunction();
  return <TicketQueueDesign {...stateAndHandlers} />;
}
