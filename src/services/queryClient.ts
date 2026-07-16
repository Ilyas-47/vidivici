import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Les données sont fraîches pendant 5 minutes
      retry: 1,                 // 1 seule tentative en cas d'échec
      refetchOnWindowFocus: false, // Pas de rafraîchissement au changement d'onglet
    },
  },
});
