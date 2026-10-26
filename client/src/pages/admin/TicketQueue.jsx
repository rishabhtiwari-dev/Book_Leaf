import React from 'react';
import { useTicketQueue } from './useTicketQueue';
import { TicketQueueView } from './TicketQueueView';

/**
 * Admin TicketQueue Page Container.
 * Binds functional filtering, sorting, and real-time socket events from useTicketQueue to TicketQueueView.
 */
export default function TicketQueue() {
  const {
    tickets,
    loading,
    error,
    status,
    setStatus,
    category,
    setCategory,
    priority,
    setPriority,
    search,
    setSearch,
    handleSearchKeyDown,
    triggerSearch,
  } = useTicketQueue();

  return (
    <TicketQueueView
      tickets={tickets}
      loading={loading}
      error={error}
      status={status}
      setStatus={setStatus}
      category={category}
      setCategory={setCategory}
      priority={priority}
      setPriority={setPriority}
      search={search}
      setSearch={setSearch}
      onSearchKeyDown={handleSearchKeyDown}
      onSearchClick={triggerSearch}
    />
  );
}
