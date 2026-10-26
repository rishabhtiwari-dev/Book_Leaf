import React from 'react';
export { formatCurrency, formatTicketNumber } from '../utils/formatters';

/**
 * Pure Visual Design Component: StatusBadge
 */
export function StatusBadge({ status }) {
  const styles = {
    OPEN: 'bg-blue-100 text-blue-700 border border-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
    RESOLVED: 'bg-green-100 text-green-700 border border-green-200',
    CLOSED: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  const labels = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

/**
 * Pure Visual Design Component: PriorityBadge
 */
export function PriorityBadge({ priority }) {
  const styles = {
    CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    LOW: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[priority] || 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {priority ? priority.charAt(0) + priority.slice(1).toLowerCase() : 'N/A'}
    </span>
  );
}

/**
 * Pure Visual Design Component: CategoryBadge
 */
export function CategoryBadge({ category }) {
  const styles = {
    ROYALTY_PAYMENTS: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    ISBN_METADATA: 'bg-purple-100 text-purple-800 border border-purple-200',
    PRINTING_QUALITY: 'bg-amber-100 text-amber-800 border border-amber-200',
    DISTRIBUTION_AVAILABILITY: 'bg-blue-100 text-blue-800 border border-blue-200',
    BOOK_STATUS_PRODUCTION: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    GENERAL_INQUIRY: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const labels = {
    ROYALTY_PAYMENTS: 'Royalty & Payments',
    ISBN_METADATA: 'ISBN & Metadata Issues',
    PRINTING_QUALITY: 'Printing & Quality',
    DISTRIBUTION_AVAILABILITY: 'Distribution & Availability',
    BOOK_STATUS_PRODUCTION: 'Book Status & Production Updates',
    GENERAL_INQUIRY: 'General Inquiry',
  };

  const label =
    labels[category] ||
    (category
      ? category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ')
      : 'General Inquiry');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[category] || 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}
    >
      {label}
    </span>
  );
}
