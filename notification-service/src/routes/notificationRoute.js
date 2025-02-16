import express from "express";
import {
  createNotification,
  getNotifications,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";
import {
  saveNotification,
  fetchAllNotifications,
} from "../services/notificationService.js";

const router = express.Router();

router.post("/", createNotification);

router.get("/", getNotifications);

router.delete("/:id", deleteNotification);

router.delete("/", deleteAllNotifications);

router.get("/active", async (req, res) => {
  try {
    const notifications = await fetchAllNotifications();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

router.post("/test", async (req, res) => {
  const testNotification = {
    userId: "testUser",
    notificationId: "testNotif001",
    latitude: 40.7128,
    longitude: -74.006,
    threshold: 85,
    comparator: "<",
    email: "test@example.com",
    interval: 30,
  };

  try {
    await saveNotification(testNotification);
    res
      .status(201)
      .json({ message: "Test notification created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create test notification." });
  }
});

export default router;
