import express from "express";
import { check } from "express-validator";
import {
  getCurrentWeather,
  getForecast,
  saveFavoriteLocation,
  getFavoriteLocations,
  deleteFavoriteLocation,
} from "../controllers/weatherController.js";
import auth from "../middleware/auth.js"; // Authentication middleware

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather data for a location
// @access  Public
router.get("/current", getCurrentWeather);

// @route   GET /api/weather/forecast
// @desc    Get forecast weather data for a location
// @access  Public
router.get("/forecast", getForecast);

// @route   POST /api/weather/favorites
// @desc    Save a favorite location
// @access  Private
router.post(
  "/favorites",
  auth,
  [check("location", "Location is required").notEmpty()],
  saveFavoriteLocation,
);

// @route   GET /api/weather/favorites
// @desc    Get all favorite locations for the authenticated user
// @access  Private
router.get("/favorites", auth, getFavoriteLocations);

// @route   DELETE /api/weather/favorites/:id
// @desc    Delete a favorite location
// @access  Private
router.delete("/favorites/:id", auth, deleteFavoriteLocation);

export default router;
