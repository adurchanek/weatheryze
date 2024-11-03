import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5002", // Proxy API requests to the backend server
      "/socket.io": {
        target: "http://localhost:5002", // Proxy socket.io connections
        ws: true, // Enable WebSocket proxying
      },
    },
  },
});
