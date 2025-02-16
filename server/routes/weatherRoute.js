import express from "express";
import { check } from "express-validator";
import {
  getCurrentWeather,
  getForecast,
  saveFavoriteLocation,
  getFavoriteLocations,
  deleteFavoriteLocation,
  getPrecipitation,
  getCurrentAirQuality,
  getWindSpeed,
  getWindData,
  getDailyWeather,
  getPrecipitationChanceData,
  getConditionData,
} from "../controllers/weatherController.js";
import auth from "../middleware/auth.js"; // Authentication middleware

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather data for a location
// @access  Public
router.get("/current", getCurrentWeather);

// @route   GET /api/weather/daily
// @desc    Get daily weather data for a location
// @access  Public
router.get("/daily", getDailyWeather);

// @route   GET /api/weather/forecast
// @desc    Get forecast weather data for a location
// @access  Public
router.get("/forecast", getForecast);

// @route   GET /api/weather/precipitation
// @desc    Get precipitation data for a location
// @access  Public
router.get("/precipitation", getPrecipitation);

// @route   GET /api/weather/windSpeed
// @desc    Get wind speed data for a location
// @access  Public
router.get("/windspeed", getWindSpeed);

// @route   GET /api/weather/wind
// @desc    Get wind data for a location
// @access  Public
router.get("/wind", getWindData);

// @route   GET /api/weather/precipitation-chance
// @desc    Get precipitation chance data for a location
// @access  Public
router.get("/precipitation-chance", getPrecipitationChanceData);

// @route   GET /api/weather/condition
// @desc    Get condition data for a location
// @access  Public
router.get("/condition", getConditionData);

// GET /api/weather/current-air-quality
router.get("/current-air-quality", getCurrentAirQuality);

router.post(
  "/favorites",
  auth,
  [
    check("location.name", "Name is required").notEmpty(),
    check("location.latitude", "Latitude is required").notEmpty(),
    check("location.longitude", "Longitude is required").notEmpty(),
    check("location.country", "Country is required").notEmpty(),
    check("location.countryCode", "Country code is required").notEmpty(),
    check("location.id", "Location ID is required").notEmpty(),
  ],
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
