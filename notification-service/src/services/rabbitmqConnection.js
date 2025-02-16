import amqplib from "amqplib";
import { getParameter } from "../utils/getParameter.js";

const rabbitmq_url = await getParameter(
  "/weatheryze/prod/backend/RABBITMQ_URL",
);

let connection = null;
let connectionRetries = 0;
const MAX_RETRIES = 100;
const RETRY_INTERVAL = 5000;

export const getRabbitMQConnection = async () => {
  if (connection) {
    return connection;
  }

  while (connectionRetries < MAX_RETRIES) {
    try {
      console.log(`Connecting to RabbitMQ`);
      connection = await amqplib.connect(rabbitmq_url, {
        protocol: "amqps",
        rejectUnauthorized: true,
      });

      // Handle connection errors
      connection.on("error", (error) => {
        console.error("RabbitMQ connection error:", error.message);
        connection = null;
        retryConnection();
      });

      // Handle connection closures
      connection.on("close", () => {
        console.warn("RabbitMQ connection closed. Reconnecting...");
        connection = null;
        retryConnection();
      });

      console.log("RabbitMQ connection established.");
      connectionRetries = 0; // Reset retries on success
      return connection;
    } catch (error) {
      console.error(
        `RabbitMQ connection failed (${MAX_RETRIES - connectionRetries} retries left):`,
        error.message,
      );
      connectionRetries++;
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  throw new Error("Failed to connect to RabbitMQ after maximum retries.");
};

// Retry logic
const retryConnection = async () => {
  if (connectionRetries >= MAX_RETRIES) {
    console.error("RabbitMQ reconnection failed after maximum retries.");
    return;
  }

  console.log("Retrying RabbitMQ connection...");
  connectionRetries++;
  await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
  try {
    await getRabbitMQConnection();
  } catch (error) {
    console.error("RabbitMQ reconnection attempt failed:", error.message);
  }
};
