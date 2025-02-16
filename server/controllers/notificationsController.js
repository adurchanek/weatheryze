import axios from "axios";
import { sendLog } from "../utils/logging.js";

const envNotificationServiceUrl =
  process.env.NODE_ENV === "production"
    ? "notification-service"
    : "notification-service";

export const createNotification = async (req, res) => {
  try {
    const response = await axios.post(
      `http://${envNotificationServiceUrl}:5006/api/v1/notifications-service/notifications`,
      req.body,
    );

    await sendLog("Successfully created notification via gateway.", "INFO");
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error in createNotification gateway controller:", err);
    await sendLog(
      `Error forwarding createNotification to notifications microservice: ${err.message}`,
      "ERROR",
    );
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res
      .status(500)
      .json({ message: "Server error creating notification." });
  }
};

export const getNotifications = async (req, res) => {
  const { userId } = req.query;
  try {
    const response = await axios.get(
      `http://${envNotificationServiceUrl}:5006/api/v1/notifications-service/notifications`,
      {
        params: { userId },
      },
    );

    await sendLog("Successfully fetched notifications via gateway.", "INFO");
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error in getNotifications gateway controller:", err);
    await sendLog(
      `Error forwarding getNotifications to notifications microservice: ${err.message}`,
      "ERROR",
    );
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res
      .status(500)
      .json({ message: "Server error fetching notifications." });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const response = await axios.delete(
      `http://${envNotificationServiceUrl}:5006/api/v1/notifications-service/notifications/${id}`,
      {
        data: { userId },
      },
    );

    await sendLog("Successfully deleted notification via gateway.", "INFO");
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error in deleteNotification gateway controller:", err);
    await sendLog(
      `Error forwarding deleteNotification to notifications microservice: ${err.message}`,
      "ERROR",
    );
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res
      .status(500)
      .json({ message: "Server error deleting notification." });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const response = await axios.delete(
      `http://${envNotificationServiceUrl}:5006/api/v1/notifications-service/notifications`,
    );
    await sendLog(
      "Successfully deleted ALL notifications via gateway.",
      "INFO",
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error in deleteAllNotifications gateway controller:", err);
    await sendLog(
      `Error forwarding deleteAllNotifications to notifications microservice: ${err.message}`,
      "ERROR",
    );
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res
      .status(500)
      .json({ message: "Server error deleting notifications." });
  }
};
