import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js"; // Note the `.js` extension
import weatherRoutes from "./routes/weather.js"; // Note the `.js` extension

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

export default app;
