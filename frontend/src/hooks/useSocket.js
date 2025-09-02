import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export const useSocket = (session) => {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (session) {
      console.log("🔑 useSocket got session:", session)

      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token: session.access_token }
      })

      newSocket.on("connect", () => {
        console.log("✅ Socket connected!", newSocket.id)
        setSocket(newSocket) // ✅ ensure Chat gets a live socket
      })

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connect error:", err.message)
      })

      newSocket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason)
        setSocket(null)
      })

      socketRef.current = newSocket

      return () => {
        console.log("🔌 Disconnecting socket")
        newSocket.disconnect()
      }
    }
  }, [session])

  return socket
}
