import { QueryClient } from '@tanstack/react-query';

// One per page render on the server, one per browser tab.
// Site content changes rarely: no refetch on focus, no retries (a missing item is a 404, not a glitch).
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: false, refetchOnWindowFocus: false } },
  });
