import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notificationRoutes from "./routes/notificationRoute.js";
import processRoutes from "./routes/processRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/notifications-service/notifications", notificationRoutes);
app.use("/api/v1/notifications-service/process", processRoutes);

app.get("/api/v1/notifications-service/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/api/v1/notifications-service/test", (req, res) => {
  console.log("Test /api/v1/notifications-service/test");
  res.send(`${process.env.HOSTNAME || "unknown"}`);
});

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Notifications service is running on port ${PORT}`);
});
