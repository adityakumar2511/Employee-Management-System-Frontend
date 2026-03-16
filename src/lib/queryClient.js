import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // हमेशा fresh consider karo
      cacheTime: 1000 * 60 * 5,        // 5 min cache
      retry: 1,
      refetchOnWindowFocus: true,      // Tab pe wapas aao toh refresh
      refetchOnReconnect: true,        // Internet reconnect par refresh
    },
    mutations: {
      retry: 0,
    },
  },
})