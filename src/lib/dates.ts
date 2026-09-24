const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-05-12" → "12 mai 2026" (date-only values, no timezone shift). */
export const formatShortDate = (isoDate: string) => {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
};
