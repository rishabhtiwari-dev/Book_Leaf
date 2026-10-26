import React from 'react';
import { useSubmitTicketFunction } from './submitTicket.function';
import { SubmitTicketDesign } from './submitTicket.design';

/**
 * Author SubmitTicket Page Container.
 * Connects pure functional logic (submitTicket.function.js) to pure visual presentation (submitTicket.design.jsx).
 */
export default function SubmitTicket() {
  const stateAndHandlers = useSubmitTicketFunction();
  return <SubmitTicketDesign {...stateAndHandlers} />;
}
