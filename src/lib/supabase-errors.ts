export const isMissingSupabaseTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  };

  const combinedText = [candidate.code, candidate.message, candidate.details, candidate.hint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    candidate.code === 'PGRST205' ||
    candidate.code === '42P01' ||
    combinedText.includes('could not find the table') ||
    combinedText.includes('schema cache') ||
    combinedText.includes('relation "public.')
  );
};