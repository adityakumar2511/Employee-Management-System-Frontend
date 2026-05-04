"use client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/queryClient"
import { useSocket } from "@/hooks/useSocket"
import useAuthStore from "@/store/authStore"
import BackendLoader from "@/components/ui/BackendLoader"
import { usePathname } from "next/navigation"  // ← add karo

function SocketProvider({ children }) {
  const user = useAuthStore((state) => state.user)
  useSocket(user?.id || null, user?.role === "ADMIN")
  return children
}

export default function Providers({ children }) {
  const pathname = usePathname()  // ← add karo
  const isAuthPage = pathname?.startsWith("/auth")  // ← add karo

  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ Auth pages par BackendLoader mat dikhao */}
      {isAuthPage ? (
        <SocketProvider>{children}</SocketProvider>
      ) : (
        <BackendLoader>
          <SocketProvider>
            {children}
          </SocketProvider>
        </BackendLoader>
      )}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}