import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticateSocket } from './middleware/auth.js'
import { handleConnection } from './socket/handlers.js'
import messagesRouter from './routes/messages.js'

dotenv.config({ path: '.env.local' })

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(express.json())

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/messages', messagesRouter)

// Socket.IO middleware and handlers
io.use(authenticateSocket)

io.on('connection', (socket) => {
  // ✅ Correct order: (socket, io)
  handleConnection(socket, io)
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

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
