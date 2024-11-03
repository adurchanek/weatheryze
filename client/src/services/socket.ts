import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initiateSocketConnection = () => {
  socket = io("http://localhost:5002", {
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
};

export const subscribeToWelcome = (callback: (message: any) => void) => {
  if (!socket) return;
  socket.on("welcome", callback);
};

export const unsubscribeFromWelcome = () => {
  if (!socket) return;
  socket.off("welcome");
};
