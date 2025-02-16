import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { consumeQueue } from "./services/rabbitmqConsumer.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health and Test Routes
app.get("/api/v1/messaging-service/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/api/v1/messaging-service/test", (req, res) => {
  console.log("Test /api/v1/messaging-service/test");
  res.send(`${process.env.HOSTNAME || "unknown"}`);
});

consumeQueue("alerts").catch((error) => {
  console.error("Error starting RabbitMQ consumer:", error.message);
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`Messaging Service is running on port ${PORT}`);
});
