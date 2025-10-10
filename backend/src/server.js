import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateSocket } from "./middleware/auth.js";
import { handleConnection } from "./socket/handlers.js";
import messagesRouter from "./routes/messages.js";

// -------------------------------
// Load environment variables
// -------------------------------
dotenv.config({ path: ".env.local" });

const app = express();
const server = createServer(app);

// -------------------------------
// Allowed Origins
// -------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://messaging-app-v1.vercel.app",
];

// -------------------------------
// Dynamic CORS Function
// -------------------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients like Postman

    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) // ✅ allow any Vercel preview deployment
    ) {
      console.log(`✅ CORS allowed for: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked for: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// -------------------------------
// Express Middlewares
// -------------------------------
app.use(cors(corsOptions));
app.use(express.json());

// -------------------------------
// Health Check
// -------------------------------
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// -------------------------------
// REST API Routes
// -------------------------------
app.use("/api/messages", messagesRouter);

// -------------------------------
// Socket.IO Setup
// -------------------------------
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// -------------------------------
// Socket.IO Middleware + Handlers
// -------------------------------
io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  handleConnection(socket, io);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// -------------------------------
// Server Start
// -------------------------------
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// -------------------------------
// Graceful Shutdown
// -------------------------------
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
