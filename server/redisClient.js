import redis from "redis";
import dotenv from "dotenv";
import { getParameter } from "./utils/getParameter.js";

dotenv.config();

let redisClient;

if (process.env.NODE_ENV === "test") {
  console.log("Redis not initialized for test environment.");
  redisClient = {
    get: async () => null,
    setEx: async () => null,
  };
} else {
  try {
    const redisHost = await getParameter("/weatheryze/prod/backend/REDIS_HOST");
    const redisPort = await getParameter("/weatheryze/prod/backend/REDIS_PORT");
    const redisUrl = `redis://${redisHost}:${redisPort}`;

    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        tls: process.env.NODE_ENV === "production",
        connectTimeout: 10000,
      },
    });

    redisClient.on("connect", () =>
      console.log("Redis connected successfully."),
    );
    redisClient.on("error", (err) =>
      console.error("Redis connection error:", err),
    );

    (async () => {
      try {
        await redisClient.connect();
        console.log("Redis client connected and ready to use.");
      } catch (err) {
        console.error("Failed to connect to Redis:", err.message);
      }
    })();
  } catch (error) {
    console.error("Error fetching env variables:", error);
    process.exit(1);
  }
}

export default redisClient;
