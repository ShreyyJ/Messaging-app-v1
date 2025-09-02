import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticateSocket } from './middleware/auth.js'
import { handleConnection } from './socket/handlers.js'
import messagesRouter from './routes/messages.js'

// Load env variables
dotenv.config({ path: '.env.local' })

const app = express()
const server = createServer(app)

// ✅ Allow both local and production frontend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://messaging-app-v1.vercel.app"
]

// CORS middleware for Express REST routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/messages', messagesRouter)

// ✅ Socket.IO with CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Socket middleware + handlers
io.use(authenticateSocket)
io.on('connection', (socket) => {
  handleConnection(socket, io)
})

const PORT = process.env.PORT || 3001

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})
