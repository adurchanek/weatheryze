import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoute.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/ai-service/summarizeWeather", aiRoutes);

app.get("/api/v1/ai-service/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/api/v1/ai-service/test", async (req, res) => {
  console.log("Test /api/v1/ai-service/test");
  res.send(`${process.env.HOSTNAME || "unknown"}`);
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`AI service is running on port ${PORT}`);
});
