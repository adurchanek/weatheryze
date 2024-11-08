import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import weatherRoutes from "./routes/weather.js";
import locationRoutes from "./routes/location.js";

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
app.use("/api/location", locationRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

export default app;
