import "dotenv/config";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import FavoriteLocation from "../models/FavoriteLocation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Location Routes", () => {
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

    userId = user.id;

    const payload = {
      user: {
        id: user.id,
      },
    };

    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  describe("GET /api/location/suggest", () => {
    it("should return a list of locations matching the query", async () => {
      const res = await request(app)
        .get("/api/location/suggest")
        .query({ query: "New", limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.locations.length).toBe(2);
      expect(res.body.locations[0]).toHaveProperty("name");
      expect(res.body.locations[0]).toHaveProperty("country");
      expect(res.body.locations[0]).toHaveProperty("latitude");
      expect(res.body.locations[0]).toHaveProperty("longitude");
      expect(res.body.locations[0]).toHaveProperty("id");
      expect(res.body.locations[0]).toHaveProperty("zip");
    });

    it("should return an error if query is not provided", async () => {
      const res = await request(app).get("/api/location/suggest");

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Search query is required");
    });
  });
});
