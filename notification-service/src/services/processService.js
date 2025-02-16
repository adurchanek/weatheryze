import axios from "axios";
import { SESClient } from "@aws-sdk/client-ses";
import { getRabbitMQConnection } from "./rabbitmqConnection.js";
new SESClient({ region: "us-east-2" });
export const fetchWeatherData = async ({
  latitude,
  longitude,
  type,
  range,
}) => {
  const endpointMap = {
    temperature: "forecast",
    precipitation: "precipitation",
    windSpeed: "windspeed",
  };

  const endpoint =
    endpointMap[type === "rain" || type === "snow" ? "precipitation" : type];
  if (!endpoint) {
    throw new Error(`Invalid weather type: ${type}`);
  }

  // Map type to Open-Meteo API variables
  const hourlyMap = {
    temperature: "temperature_2m",
    precipitation: "rain,snowfall",
    windSpeed: "windspeed_10m",
  };

  const hourly =
    hourlyMap[type === "rain" || type === "snow" ? "precipitation" : type];
  if (!hourly) {
    throw new Error(`No hourly data mapping for type: ${type}`);
  }

  const envUrl =
    process.env.NODE_ENV === "production" ? "weatheryze.local" : "backend";
  const url = `http://${envUrl}:5002/api/v1/backend-service/weather/${endpoint}?latitude=${encodeURIComponent(
    latitude,
  )}&longitude=${encodeURIComponent(
    longitude,
  )}&timezone=${encodeURIComponent("UTC")}&units=${encodeURIComponent(
    "imperial",
  )}&hourly=${encodeURIComponent(hourly)}&forecast_days=${range}`;

  try {
    const response = await axios.get(url);

    if (!response.data) {
      throw new Error("No data returned from weather service.");
    }

    return response.data; // The weather data response structure
  } catch (error) {
    console.error("Error fetching weather data:", error.message || error);
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error",
    );
  }
};

export const sendMessageToQueue = async (queue, message) => {
  try {
    const connection = await getRabbitMQConnection();
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));

    console.log(`Message sent to queue ${queue}:`, message);
  } catch (error) {
    console.error("Error sending message to RabbitMQ queue:", error.message);
    throw new Error("Failed to send message to RabbitMQ queue.");
  }
};
