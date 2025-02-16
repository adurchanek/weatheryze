import express from "express";
import auth from "../middleware/auth.js";
import {
  createNotification,
  getNotifications,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.post("/", auth, createNotification);

router.get("/", auth, getNotifications);

router.delete("/:id", auth, deleteNotification);

router.delete("/", auth, deleteAllNotifications);

export default router;
