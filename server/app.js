import express from "express";
import cors from "cors";
import { getParameter } from "./utils/getParameter.js";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import weatherRoutes from "./routes/weatherRoute.js";
import locationRoutes from "./routes/locationRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const isProduction = process.env.NODE_ENV === "production";
const app = express();

let clientUrls = [];

try {
  const clientUrlsString = await getParameter(
    "/weatheryze/prod/backend/CLIENT_URLS",
  );
  clientUrls = clientUrlsString.split(",");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: clientUrls,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/backend-service/weather", weatherRoutes);
app.use("/api/v1/backend-service/location", locationRoutes);
app.use("/api/v1/backend-service/notifications", notificationRoutes);
app.get("/api/v1/backend-service/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.post("/api/v1/backend-service/auth/token", async (req, res) => {
  const { code } = req.body;
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append(
    "client_id",
    await getParameter("/weatheryze/prod/backend/VITE_USER_POOL_CLIENT_ID"),
  );
  params.append(
    "redirect_uri",
    isProduction ? "https://weatheryze.com/" : "http://localhost:5173/",
  );
  params.append("code", code);

  try {
    const cognitoDomain = await getParameter(
      "/weatheryze/prod/backend/VITE_COGNITO_DOMAIN",
    );
    const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokens = await response.json();

    // Ensure the refresh token is set in a secure httpOnly cookie
    if (tokens.refresh_token) {
      console.log("Setting refreshToken as a cookie...");

      res.cookie("refreshToken", tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        domain: isProduction ? ".weatheryze.com" : undefined,
        path: "/",
      });
    }

    res.json({ access_token: tokens.access_token, id_token: tokens.id_token });
  } catch (err) {
    console.error("Token exchange failed:", err);
    res.status(400).json({ error: "Invalid authorization code" });
  }
});

app.post("/api/v1/backend-service/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Secure httpOnly cookie
  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const cognitoDomain = await getParameter(
      "/weatheryze/prod/backend/VITE_COGNITO_DOMAIN",
    );
    const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: await getParameter(
          "/weatheryze/prod/backend/VITE_USER_POOL_CLIENT_ID",
        ),
        refresh_token: refreshToken,
      }),
    });

    const tokens = await response.json();
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Route to get user info from ID token
app.post("/api/v1/backend-service/auth/user", (req, res) => {
  try {
    const { idToken } = req.body; // Ensure this is the ID token

    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    // Decode the ID token
    const decodedIdToken = jwt.decode(idToken);

    if (!decodedIdToken) {
      return res.status(400).json({ error: "Invalid ID Token" });
    }

    // Extract user details
    const userInfo = {
      username: decodedIdToken["cognito:username"] || decodedIdToken.sub,
      email: decodedIdToken.email || null,
      email_verified: decodedIdToken.email_verified || false,
      given_name: decodedIdToken.given_name || null,
      family_name: decodedIdToken.family_name || null,
      profile_picture: decodedIdToken.picture || null, // Add this
    };

    return res.json(userInfo);
  } catch (err) {
    console.error("Error decoding token:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/v1/backend-service/auth/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    domain: isProduction ? ".weatheryze.com" : undefined,
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

app.get("/api/v1/backend-service/config", async (req, res) => {
  try {
    const config = {
      userPoolId: await getParameter(
        "/weatheryze/prod/backend/VITE_USER_POOL_ID",
      ),
      userPoolClientId: await getParameter(
        "/weatheryze/prod/backend/VITE_USER_POOL_CLIENT_ID",
      ),
      region: await getParameter("/weatheryze/prod/backend/VITE_REGION"),
      domain: await getParameter(
        "/weatheryze/prod/backend/VITE_COGNITO_DOMAIN",
      ),
      scope: await getParameter("/weatheryze/prod/backend/VITE_COGNITO_SCOPE"),
      redirectSignIn: await getParameter(
        "/weatheryze/prod/backend/VITE_REDIRECT_SIGNIN",
      ),
      redirectSignOut: await getParameter(
        "/weatheryze/prod/backend/VITE_REDIRECT_SIGNOUT",
      ),
      responseType: await getParameter(
        "/weatheryze/prod/backend/VITE_RESPONSE_TYPE",
      ),
      windyApiKey: await getParameter(
        "/weatheryze/prod/backend/VITE_WINDY_API_KEY",
      ),
    };

    res.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

app.get("/api/v1/backend-service/test", async (req, res) => {
  console.log("Test /api/v1/backend-service/test");
  res.send(`${process.env.HOSTNAME || "unknown"}`);
});

export default app;
