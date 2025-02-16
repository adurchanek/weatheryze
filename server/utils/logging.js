import axios from "axios";

const envLoggingServiceUrl =
  process.env.NODE_ENV === "production"
    ? "weatheryze.local"
    : "logging-service";

export const sendLog = async (message) => {
  try {
    return await axios.post(`http://${envLoggingServiceUrl}:5005/log`, {
      level: "INFO",
      message: message,
    });
  } catch (error) {
    console.error("Error sending log:", error.message || error);
  }
};
