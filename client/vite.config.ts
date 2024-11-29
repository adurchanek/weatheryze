import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: process.env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: true, // Ensures HTTPS connections are used
        },
        "/socket.io": {
          target: process.env.VITE_BACKEND_URL,
          ws: true,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
