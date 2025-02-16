import express from "express";
import { processNotifications } from "../controllers/processController.js";

let router;
router = express.Router();

router.post("/", processNotifications);

export default router;
