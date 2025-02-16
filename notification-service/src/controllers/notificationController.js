import {
  saveNotification,
  fetchNotifications,
  removeNotification,
  removeAllNotifications,
} from "../services/notificationService.js";
import { v4 as uuidv4 } from "uuid";

export const createNotification = async (req, res) => {
  const {
    userId,
    latitude,
    longitude,
    threshold,
    comparator,
    interval,
    location,
    type,
    range,
    email,
  } = req.body;

  // Validate required fields
  if (
    !userId ||
    !latitude ||
    !longitude ||
    !threshold ||
    !comparator ||
    !interval ||
    !location ||
    !type ||
    !range ||
    !email
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate type
  const validTypes = ["temperature", "rain", "snow", "windSpeed"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: `Invalid type: ${type}. Must be one of ${validTypes.join(", ")}`,
    });
  }

  // Validate range
  const validRanges = [1, 3, 7, 14];
  if (!validRanges.includes(range)) {
    return res.status(400).json({
      message: `Invalid range: ${range}. Must be one of ${validRanges.join(", ")}`,
    });
  }

  // Generate a unique notificationId
  const notificationId = uuidv4();

  try {
    // Save notification to DynamoDB
    await saveNotification({
      userId,
      notificationId,
      latitude,
      longitude,
      threshold,
      comparator,
      email,
      interval,
      location,
      type,
      range,
    });

    res.status(201).json({ message: "Notification created successfully." });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification." });
  }
};

export const getNotifications = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const notifications = await fetchNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications." });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId || !id) {
    return res
      .status(400)
      .json({ message: "User ID and Notification ID are required." });
  }

  try {
    await removeNotification(userId, id);
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification." });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await removeAllNotifications();
    res
      .status(200)
      .json({ message: "All notifications deleted successfully." });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Error deleting all notifications." });
  }
};
