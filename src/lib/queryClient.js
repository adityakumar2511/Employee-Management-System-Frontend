import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,     // ✅ 2 min — bar bar refetch nahi
      gcTime: 1000 * 60 * 10,       // ✅ 10 min cache memory mein rakho
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,  // ✅ Tab switch par refetch band
      refetchOnReconnect: true,
      refetchOnMount: true,         // ✅ Pehli baar mount par fetch karo
    },
    mutations: {
      retry: 0,
    },
  },
})