import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIoServer } from "socket.io";
import app from "./app.js";
import { getParameter } from "./utils/getParameter.js";

const server = http.createServer(app);

let clientUrls;

let port;

try {
  const clientUrlsString = await getParameter(
    "/weatheryze/prod/backend/CLIENT_URLS",
  );
  clientUrls = clientUrlsString.split(",");

  port = await getParameter("/weatheryze/prod/backend/PORT");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

// Initialize Socket.io
const io = new SocketIoServer(server, {
  cors: {
    origin: clientUrls,
    methods: ["GET", "POST", "DELETE"],
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
