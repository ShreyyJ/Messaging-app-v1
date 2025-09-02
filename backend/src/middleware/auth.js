import jwt from 'jsonwebtoken'

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      throw new Error('No token provided')
    }

    // Verify token using Supabase JWT secret
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET)

    // Attach user info to socket
    socket.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.user_metadata?.username || decoded.email.split('@')[0]
    }

    console.log("✅ Authenticated user:", socket.user)
    next()
  } catch (error) {
    console.error("❌ Authentication failed:", error.message)
    next(new Error('Authentication failed: ' + error.message))
  }
}
