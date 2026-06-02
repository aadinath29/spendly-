import { format, parseISO } from 'date-fns';

// Change this one line to switch the app's currency (e.g. 'INR', 'EUR', 'GBP').
export const CURRENCY = 'USD';

export const formatCurrency = (value, { compact = false } = {}) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: CURRENCY,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(Number(value) || 0);

export const formatDate = (value, pattern = 'MMM d, yyyy') => {
  if (!value) return '';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern);
};

/** Today's date as YYYY-MM-DD (local), handy for date inputs. */
export const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
};
