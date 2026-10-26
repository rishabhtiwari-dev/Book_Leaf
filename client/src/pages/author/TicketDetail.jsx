import React from 'react';
import { useAuthorTicketDetail } from './useAuthorTicketDetail';
import { AuthorTicketDetailView } from './AuthorTicketDetailView';

/**
 * Author TicketDetail Page Container.
 * Binds functional ticket detail fetching and real-time socket events to AuthorTicketDetailView.
 */
export default function TicketDetail() {
  const { ticket, loading, error } = useAuthorTicketDetail();

  return <AuthorTicketDetailView ticket={ticket} loading={loading} error={error} />;
}
