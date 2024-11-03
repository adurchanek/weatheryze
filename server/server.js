import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIoServer } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";

const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketIoServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("welcome", { message: "Welcome to the Weather App!" });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", reason);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Start the server after DB connection
    const PORT = process.env.PORT || 5002;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
