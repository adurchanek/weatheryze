import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Environment Variables", () => {
  it("should have JWT_SECRET defined", () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(typeof process.env.JWT_SECRET).toBe("string");
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
  });
});

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "Test@1234",
      };

      const res = await request(app).post("/api/auth/register").send(user);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should not register a user with existing email", async () => {
      // Create an existing user
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
      });

      const newUser = {
        name: "New User",
        email: "existing@example.com",
        password: "NewUser@123",
      };

      const res = await request(app).post("/api/auth/register").send(newUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("User already exists");
    });

    it("should not register a user with missing fields", async () => {
      const incompleteUser = {
        name: "",
        email: "",
        password: "",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(incompleteUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("should not register a user with an invalid email format", async () => {
      const invalidEmailUser = {
        name: "Invalid Email User",
        email: "invalidemail",
        password: "Valid@1234",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidEmailUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.some((e) => e.msg.includes("valid email"))).toBe(
        true,
      );
    });

    it("should not register a user with weak password", async () => {
      const weakPasswordUser = {
        name: "Weak Password User",
        email: "weakpass@example.com",
        password: "123",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(weakPasswordUser);

      expect(res.statusCode).toBe(400);
      expect(
        res.body.errors.some((e) =>
          e.msg.includes("Password must be 6 or more characters"),
        ),
      ).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user to login
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Login@1234", salt);

      await User.create({
        name: "Login User",
        email: "loginuser@example.com",
        password: hashedPassword,
      });
    });

    it("should login a user successfully with correct credentials", async () => {
      const credentials = {
        email: "loginuser@example.com",
        password: "Login@1234",
      };

      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should not login with incorrect password", async () => {
      const credentials = {
        email: "loginuser@example.com",
        password: "WrongPassword",
      };

      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Invalid credentials");
    });

    it("should not login a non-existent user", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "NoUser@123",
      };

      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Invalid credentials");
    });

    it("should not login with missing fields", async () => {
      const incompleteCredentials = {
        email: "",
        password: "",
      };

      const res = await request(app)
        .post("/api/auth/login")
        .send(incompleteCredentials);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/auth/user", () => {
    let token;

    beforeEach(async () => {
      // Create and log in a user to obtain token
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Password@123", salt);

      const user = await User.create({
        name: "Auth User",
        email: "authuser@example.com",
        password: hashedPassword,
      });

      const payload = {
        user: {
          id: user.id,
        },
      };

      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    });

    it("should get the authenticated user", async () => {
      const res = await request(app)
        .get("/api/auth/user")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("email", "authuser@example.com");
      expect(res.body).toHaveProperty("name", "Auth User");
      expect(res.body).toHaveProperty("_id");
    });

    it("should not allow access without token", async () => {
      const res = await request(app).get("/api/auth/user");

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("No token, authorization denied");
    });

    it("should not allow access with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/user")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("Token is not valid");
    });
  });
});
