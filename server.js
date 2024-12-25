const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors"); // Import cors middleware

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

// Enable CORS middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// Default route to confirm the server is running
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running!");
});

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`[${new Date().toISOString()}] A user connected`);

  // Listen for a message from the client
  socket.on("message", (msg) => {
    console.log(`[${new Date().toISOString()}] Message received: ${msg}`);
    // Broadcast the message to all connected clients
    io.emit("message", msg);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`[${new Date().toISOString()}] A user disconnected`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});
