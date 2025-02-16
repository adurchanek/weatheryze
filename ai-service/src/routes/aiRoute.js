import express from "express";
import { summarizeWeather } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", summarizeWeather);

export default router;
