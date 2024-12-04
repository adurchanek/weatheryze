import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoute.js";
import weatherRoutes from "./routes/weatherRoute.js";
import locationRoutes from "./routes/locationRoute.js";

const app = express();

const clientUrls = process.env.CLIENT_URLS.split(",");

// Middleware
app.use(
  cors({
    origin: [clientUrls],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/location", locationRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
