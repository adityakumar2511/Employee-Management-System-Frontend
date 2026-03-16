import { io } from "socket.io-client"

// API URL se /api remove karke base URL lo
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
  .replace("/api", "")

export const socket = io(BASE_URL, {
  autoConnect: false,         // Manually connect karenge (useSocket mein)
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})