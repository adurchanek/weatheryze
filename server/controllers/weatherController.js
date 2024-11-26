import { validationResult } from "express-validator";
import FavoriteLocation from "../models/FavoriteLocation.js";
import fetchWeather from "../services/weatherService.js";

// Dummy data for weather and location search
const dummyWeatherData = {
  temperature: 25,
  condition: "Sunny",
  humidity: 50,
  windSpeed: 10,
};

// @desc    Get current weather data for a location
// @route   GET /api/weather/current
// @access  Public
export const getCurrentWeather = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ msg: "Location is required" });
  }

  try {
    const weatherData = { location, ...dummyWeatherData };
    res.json(weatherData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Get forecast weather data for a location
// @route   GET /api/weather/forecast
// @access  Public
export const getForecast = async (req, res) => {
  const { latitude, longitude, timezone } = req.query;

  if (!latitude || !longitude || !timezone) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  const request = {
    latitude: latitude,
    longitude: longitude,
    timezone: timezone,
    hourly: "temperature_2m",
  };

  try {
    const data = await fetchWeather(request);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Save a favorite location
// @route   POST /api/weather/favorites
// @access  Private
export const saveFavoriteLocation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { location } = req.body;

  try {
    const newFavorite = new FavoriteLocation({
      user: req.user.id,
      location,
    });
    const favorite = await newFavorite.save();
    res.json(favorite);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Get all favorite locations for the authenticated user
// @route   GET /api/weather/favorites
// @access  Private
export const getFavoriteLocations = async (req, res) => {
  try {
    const favorites = await FavoriteLocation.find({ user: req.user.id });
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Delete a favorite location
// @route   DELETE /api/weather/favorites/:id
// @access  Private
export const deleteFavoriteLocation = async (req, res) => {
  try {
    const favorite = await FavoriteLocation.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ msg: "Favorite location not found" });
    }

    if (favorite.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await favorite.deleteOne();
    res.json({ msg: "Favorite location removed" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId" || err.name === "CastError") {
      return res.status(404).json({ msg: "Favorite location not found" });
    }

    res.status(500).send("Server error");
  }
};
