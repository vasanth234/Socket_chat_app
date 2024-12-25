const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const winston = require("winston");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200"; // Default to local frontend

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL], // Add more origins if necessary
    methods: ["GET", "POST"],
  },
});

// Set up logging with Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

// Default route to confirm the server is running
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running!");
});

// Handle socket connection
io.on("connection", (socket) => {
  logger.info("A user connected");

  // Listen for a message from the client
  socket.on("message", (msg) => {
    logger.info(`Message received: ${msg}`);
    // Broadcast the message to all connected clients
    io.emit("message", msg);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    logger.info("A user disconnected");
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Something went wrong!");
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
});

// Optional: Example for namespaces
const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
  logger.info("User connected to chat namespace");

  socket.on("message", (msg) => {
    logger.info(`Chat namespace message: ${msg}`);
    chatNamespace.emit("message", msg);
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected from chat namespace");
  });
});
