import "dotenv/config";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import FavoriteLocation from "../models/FavoriteLocation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetchWeather from "../services/weatherService.js";
import { jest } from "@jest/globals";

jest.mock("../services/weatherService.js");

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany();
  await FavoriteLocation.deleteMany();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  const user = await User.create({
    name: "Test User",
    email: uniqueEmail,
    password: hashedPassword,
  });

  userId = user.id;

  const payload = { user: { id: user.id } };
  token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
});

describe("Weather Routes", () => {
  beforeEach(async () => {
    // Create a user and obtain a JWT token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Use a unique email for each test run
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    const user = await User.create({
      name: "Test User",
      email: uniqueEmail,
      password: hashedPassword,
    });

    userId = user.id; // Store the user ID

    const payload = {
      user: {
        id: user.id,
      },
    };

    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  describe("GET /api/weather/current", () => {
    it("should get current weather data for a location", async () => {
      const res = await request(app)
        .get("/api/weather/current")
        .query({ location: "New York" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("location", "New York");
      expect(res.body).toHaveProperty("temperature");
      expect(res.body).toHaveProperty("condition");
    });

    it("should return an error if location is not provided", async () => {
      const res = await request(app).get("/api/weather/current");

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Location is required");
    });
  });

  describe("POST /api/weather/favorites", () => {
    it("should save a favorite location", async () => {
      const res = await request(app)
        .post("/api/weather/favorites")
        .set("Authorization", `Bearer ${token}`)
        .send({ location: "New York" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("location", "New York");
      expect(res.body).toHaveProperty("user");
    });

    it("should return an error if location is not provided", async () => {
      const res = await request(app)
        .post("/api/weather/favorites")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Location is required");
    });

    it("should return an error if not authenticated", async () => {
      const res = await request(app)
        .post("/api/weather/favorites")
        .send({ location: "New York" });

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("No token, authorization denied");
    });
  });

  describe("GET /api/weather/favorites", () => {
    it("should get all favorite locations for the user", async () => {
      // Add a favorite location
      await FavoriteLocation.create({
        user: userId, // Use the stored user ID
        location: "New York",
      });

      const res = await request(app)
        .get("/api/weather/favorites")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty("location", "New York");
    });

    it("should return an error if not authenticated", async () => {
      const res = await request(app).get("/api/weather/favorites");

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("No token, authorization denied");
    });
  });

  describe("DELETE /api/weather/favorites/:id", () => {
    it("should delete a favorite location", async () => {
      // Add a favorite location
      const favorite = await FavoriteLocation.create({
        user: userId, // Use the stored user ID
        location: "New York",
      });

      const res = await request(app)
        .delete(`/api/weather/favorites/${favorite.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe("Favorite location removed");
    });

    it("should return an error if favorite location not found", async () => {
      const res = await request(app)
        .delete("/api/weather/favorites/invalidid")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe("Favorite location not found");
    });

    it("should return an error if not authorized", async () => {
      // Add a favorite location as another user
      const otherUserId = new mongoose.Types.ObjectId();
      const favorite = await FavoriteLocation.create({
        user: otherUserId,
        location: "London",
      });

      const res = await request(app)
        .delete(`/api/weather/favorites/${favorite.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("User not authorized");
    });
  });

  describe("GET /api/weather/forecast", () => {
    it("should return forecast data for valid location and timezone", async () => {
      fetchWeather.mockResolvedValueOnce({
        hourly: {
          time: ["2024-11-26T00:00:00Z", "2024-11-26T01:00:00Z"],
          temperature2m: [9.28, 9.18],
        },
        utcOffsetSeconds: 3600,
      });

      const res = await request(app).get("/api/weather/forecast").query({
        latitude: "40.7128",
        longitude: "-74.0060",
        timezone: "America/New_York",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.hourly.time).toEqual([
        "2024-11-26T00:00:00Z",
        "2024-11-26T01:00:00Z",
      ]);
      expect(res.body.hourly.temperature2m).toEqual([9.28, 9.18]);
      expect(res.body.utcOffsetSeconds).toEqual(3600);
    });

    it("should return a 400 error if latitude is missing", async () => {
      const res = await request(app).get("/api/weather/forecast").query({
        longitude: "-74.0060",
        timezone: "America/New_York",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Location and timezone are required");
    });

    it("should return a 400 error if longitude is missing", async () => {
      const res = await request(app).get("/api/weather/forecast").query({
        latitude: "40.7128",
        timezone: "America/New_York",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Location and timezone are required");
    });

    it("should return a 400 error if timezone is missing", async () => {
      const res = await request(app).get("/api/weather/forecast").query({
        latitude: "40.7128",
        longitude: "-74.0060",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Location and timezone are required");
    });

    it("should return 500 if weather service throws an error", async () => {
      fetchWeather.mockImplementationOnce(() => {
        throw new Error("Weather service error");
      });

      const res = await request(app).get("/api/weather/forecast").query({
        latitude: "40.7128",
        longitude: "-74.0060",
        timezone: "America/New_York",
      });

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe("Server error");
    });
  });
});
