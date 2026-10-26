import { format, formatDistanceToNow } from 'date-fns';

/**
 * Pure Functional Utility: Currency Formatter
 * Formats a numeric value into Indian Rupees (INR) format.
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount == null) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Pure Functional Utility: Standard Number Formatter
 * @param {number|null|undefined} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString('en-IN');
}

/**
 * Pure Functional Utility: Ticket Number Formatter
 * Ensures tickets have a standard formatted ID string (e.g. TKT-0001).
 * @param {object|string|number} ticketOrId
 * @returns {string}
 */
export function formatTicketNumber(ticketOrId) {
  if (!ticketOrId) return '';
  if (typeof ticketOrId === 'string' && ticketOrId.startsWith('TKT-')) {
    return ticketOrId;
  }
  if (typeof ticketOrId === 'object' && ticketOrId !== null) {
    if (ticketOrId.ticketNumber) return ticketOrId.ticketNumber;
    if (ticketOrId.ticketNo) return ticketOrId.ticketNo;
    if (ticketOrId.id) return `TKT-${String(ticketOrId.id).padStart(4, '0')}`;
  }
  return `TKT-${String(ticketOrId).padStart(4, '0')}`;
}

/**
 * Pure Functional Utility: Absolute Date Formatter
 * @param {string|Date|null|undefined} date
 * @param {string} [pattern='MMM d, yyyy']
 * @returns {string}
 */
export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return '';
  try {
    return format(new Date(date), pattern);
  } catch {
    return '';
  }
}

/**
 * Pure Functional Utility: Relative Time Formatter
 * @param {string|Date|null|undefined} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

