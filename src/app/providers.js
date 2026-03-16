"use client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/queryClient"
import { useSocket } from "@/hooks/useSocket"
import useAuthStore from "@/store/authStore"

// Socket wrapper — auth store se user lo aur socket initialize karo
function SocketProvider({ children }) {
  const user = useAuthStore((state) => state.user)

  useSocket(
    user?.id || null,
    user?.role === "ADMIN"
  )

  return children
}

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
      </SocketProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}