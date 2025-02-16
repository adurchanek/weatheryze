import express from "express";
import cors from "cors";
import locationRoutes from "./routes/locationRoute.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/location-service/location", locationRoutes);

app.get("/api/v1/location-service/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/api/v1/location-service/test", async (req, res) => {
  console.log("Test /api/v1/location-service/test");
  res.send(`${process.env.HOSTNAME || "unknown"}`);
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Location service is running on port ${PORT}`);
});
