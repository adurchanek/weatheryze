import { validationResult } from "express-validator";
import {
  saveFavoriteLocation as saveFavoriteQuery,
  getFavoriteLocations as getFavoriteQuery,
  deleteFavoriteLocation as deleteFavoriteQuery,
} from "../db/queries/favorites.js";
import {
  fetchWeather,
  fetchCurrentWeather,
  fetchCurrentAirQuality,
  fetchDailyWeather,
} from "../services/weatherService.js";
import redisClient from "../redisClient.js";
import {
  getForecastDataByDay,
  getPrecipitationDataByDay,
  getWindDataByDay,
  getPrecipitationChanceByDay,
} from "../utils/weatherDataUtil.js";

import axios from "axios";
import { sendLog } from "../utils/logging.js";

const mockCurrentWeatherData = {
  weather: {
    temperature: 67.30999755859375,
    condition: "Cloudy",
    humidity: 84,
    windSpeed: 3.579200029373169,
    windDirection: 90,
    apparentTemperature: 65.94825744628906,
  },
  summary:
    "In Puyo today, expect a pleasantly cool, cozy, cloud-covered sky at about 64°F. Humidity is giving an enthusiastic 84% hug—hello moisture! A gentle 3.6 mph breeze from the east whispers sweet nothings. Enjoy nature's canopy while you ponder life in the jungle!",
};

const mockDailyData = {
  daily: {
    temperature2mMax: [83.94979858398438],
    temperature2mMin: [69.54979705810547],
  },
  utcOffsetSeconds: -10800,
  timezone: "America/Fortaleza",
};

const aiServiceEnvUrl =
  process.env.NODE_ENV === "production" ? "weatheryze.local" : "ai-service";

export const getCurrentWeather = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    units = "imperial",
    location = "",
  } = req.query;

  await sendLog(
    `Received request for current weather - Latitude: ${latitude}, Longitude: ${longitude}, Timezone: ${timezone}, Units: ${units}, Location: ${location}`,
  );

  if (!latitude || !longitude || !timezone || !location) {
    return res
      .status(400)
      .json({ msg: "Latitude, Longitude, and Timezone are required" });
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Using mocked current weather");
    return res.json(mockCurrentWeatherData);
  }

  const cacheKey = `getCurrentWeather${latitude},${longitude},${timezone},${units}`;

  try {
    // Check Redis Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await sendLog(`Cache hit for key $$$: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    } else {
      await sendLog(`Cache miss for key $$$: ${cacheKey}`);
    }

    const params = {
      latitude: latitude,
      longitude: longitude,
      timezone: timezone,
      temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
      wind_speed_unit: units === "imperial" ? "mph" : "kmh",
      precipitation_unit: units === "imperial" ? "inch" : "mm",
    };

    const weatherData = await fetchCurrentWeather(params);

    const { data: summary } = await axios.post(
      `http://${aiServiceEnvUrl}:5004/api/v1/ai-service/summarizeWeather`,
      {
        weatherData,
        units,
        location,
      },
    );

    const response = {
      weather: weatherData,
      summary: summary,
    };

    // Save to Redis Cache (unique key includes units)
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response));

    await sendLog(`Response sent successfully: ${JSON.stringify(response)}`);

    res.json(response);
  } catch (err) {
    const errorMessage = `Error in getCurrentWeather: ${err.message}`;

    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${loggingError.message || loggingError}`,
      );
    }

    // Always log the error locally, even if logging service fails
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get wind speed data for a location
// @route   GET /api/weather/windspeed
// @access  Public
export const getDailyWeather = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for getDailyWeather");
  //   return res.json(mockDailyData);
  // }

  // Build a cache key to store/fetch this data in Redis
  const cacheKey = `daily-weather-data:${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude,
    longitude,
    timezone,
    forecast_days: forecast_days,
    daily: "temperature_2m_min,temperature_2m_max",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    precipitation_unit: units === "imperial" ? "inch" : "mm",
  };

  try {
    // Check if we already have this data in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Otherwise, fetch fresh data from the weather API
    const data = await fetchDailyWeather(params);

    // Cache the data for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    // Send to client
    return res.json(data);
  } catch (err) {
    const errorMessage = `Error in getWindSpeed: ${err.message}`;

    // Attempt logging to external service
    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${
          loggingError.message || loggingError
        }`,
      );
    }

    // Always log locally
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get forecast weather data for a location
// @route   GET /api/weather/forecast
// @access  Public
export const getForecast = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for forecast/temp");
  //   return res.json(getForecastDataByDay(forecast_days));
  // }

  const cacheKey = `getForecast${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude: latitude,
    longitude: longitude,
    timezone: timezone,
    hourly: "temperature_2m",
    forecast_days: forecast_days,
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
  };

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const data = await fetchWeather(params);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
    res.json(data);
  } catch (err) {
    const errorMessage = `Error in getForecast: ${err.message}`;

    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${loggingError.message || loggingError}`,
      );
    }

    // Always log the error locally, even if logging service fails
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get precipitation data for a location
// @route   GET /api/weather/precipitation
// @access  Public
export const getPrecipitation = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for precip");
  //   return res.json(getPrecipitationDataByDay(forecast_days));
  // }

  const cacheKey = `getPrecipitation${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude: latitude,
    longitude: longitude,
    timezone: timezone,
    hourly: "rain,snowfall,showers",
    forecast_days: forecast_days,
    precipitation_unit: units === "imperial" ? "inch" : "mm",
  };

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for getPrecipitation:", cacheKey);
      return res.json(JSON.parse(cachedData));
    }

    const data = await fetchWeather(params);

    for (let i = 0; i < data.hourly.rain.length; i++) {
      data.hourly.rain[i] = data.hourly.rain[i] + data.hourly.showers[i];
    }

    delete data.hourly.showers;

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
    res.json(data);
  } catch (err) {
    const errorMessage = `Error in getPrecipitation: ${err.message}`;

    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${loggingError.message || loggingError}`,
      );
    }

    // Always log the error locally, even if logging service fails
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get wind speed data for a location
// @route   GET /api/weather/windspeed
// @access  Public
export const getWindSpeed = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial", // "imperial" -> mph; "metric" -> km/h
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for wind speed");
  //   return res.json(getWindDataByDay(forecast_days));
  // }

  // Build a cache key to store/fetch this data in Redis
  const cacheKey = `getWindSpeed:${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude,
    longitude,
    timezone,
    hourly: "windspeed_10m",
    forecast_days: forecast_days,
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
  };

  try {
    // Check if we already have this data in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Otherwise, fetch fresh data from the weather API
    const data = await fetchWeather(params);

    // Cache the data for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    // Send to client
    return res.json(data);
  } catch (err) {
    const errorMessage = `Error in getWindSpeed: ${err.message}`;

    // Attempt logging to external service
    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${
          loggingError.message || loggingError
        }`,
      );
    }

    // Always log locally
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get wind data for a location
// @route   GET /api/weather/wind
// @access  Public
export const getWindData = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Mock data used for wind");
    return res.json(getWindDataByDay(forecast_days));
  }

  // Build a cache key to store/fetch this data in Redis
  const cacheKey = `wind-data:${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude,
    longitude,
    timezone,
    hourly: "windspeed_10m,winddirection_10m",
    forecast_days: forecast_days,
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
  };

  try {
    // Check if we already have this data in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Otherwise, fetch fresh data from the weather API
    const data = await fetchWeather(params);

    // Cache the data for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    // Send to client
    return res.json(data);
  } catch (err) {
    const errorMessage = `Error in getWindSpeed: ${err.message}`;

    // Attempt logging to external service
    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${
          loggingError.message || loggingError
        }`,
      );
    }

    // Always log locally
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get precipitation chance data for a location
// @route   GET /api/weather/precipitation-chance
// @access  Public
export const getPrecipitationChanceData = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for precipitation chance", forecast_days);
  //   return res.json(getPrecipitationChanceByDay(forecast_days));
  // }

  // Build a cache key to store/fetch this data in Redis
  const cacheKey = `precipitation-chance-data:${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude,
    longitude,
    timezone,
    hourly: "precipitation_probability",
    forecast_days: forecast_days,
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
  };

  try {
    // Check if we already have this data in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Otherwise, fetch fresh data from the weather API
    const data = await fetchWeather(params);

    // Cache the data for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    // Send to client
    return res.json(data);
  } catch (err) {
    const errorMessage = `Error in getPrecipitationChanceData: ${err.message}`;

    // Attempt logging to external service
    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${
          loggingError.message || loggingError
        }`,
      );
    }

    // Always log locally
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

// @desc    Get condition data for a location
// @route   GET /api/weather/condition
// @access  Public
export const getConditionData = async (req, res) => {
  const {
    latitude,
    longitude,
    timezone,
    forecast_days,
    units = "imperial",
  } = req.query;

  if (!latitude || !longitude || !timezone || !units) {
    return res.status(400).json({ msg: "Location and timezone are required" });
  }

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Mock data used for getConditionData", forecast_days);
  //   return res.json(getConditionDataByDay(forecast_days));
  // }

  // Build a cache key to store/fetch this data in Redis
  const cacheKey = `condition-data:${latitude},${longitude},${timezone},${forecast_days},${units}`;

  const params = {
    latitude,
    longitude,
    timezone,
    hourly: "weather_code",
    forecast_days: forecast_days,
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
  };

  try {
    // Check if we already have this data in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    } else {
      console.log("Cache miss for getConditionData");
    }

    // Otherwise, fetch fresh data from the weather API
    const data = await fetchWeather(params);

    // Cache the data for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

    // Send to client
    return res.json(data);
  } catch (err) {
    const errorMessage = `Error in getConditionData: ${err.message}`;

    // Attempt logging to external service
    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${
          loggingError.message || loggingError
        }`,
      );
    }

    // Always log locally
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

export const getCurrentAirQuality = async (req, res) => {
  try {
    const { latitude, longitude, timezone } = req.query;

    if (!latitude || !longitude || !timezone) {
      return res
        .status(400)
        .json({ msg: "Latitude, Longitude, and Timezone are required" });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Mock data used for air quality");
      return res.json({
        overallAQI: 152.76316833496094,
        overallLabel: "Hazardous",
        breakdown: {
          pm25: {
            aqi: 152.76316833496094,
            label: "Unhealthy",
          },
          pm10: {
            aqi: 54.51042175292969,
            label: "Moderate",
          },
          ozone: {
            aqi: 20.640073776245117,
            label: "Unhealthy for Sensitive Groups",
          },
          so2: {
            aqi: 10.687023162841797,
            label: "Caution",
          },
          no2: {
            aqi: 4.974389553070068,
            label: "Good",
          },
        },
      });
    }

    // Fetch the current air quality
    const params = { latitude, longitude, timezone };

    const cacheKey = `getCurrentAirQuality${latitude},${longitude},${timezone}`;

    // Check Redis Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const airQualityData = await fetchCurrentAirQuality(params);
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(airQualityData));

    return res.json(airQualityData);
  } catch (err) {
    const errorMessage = `Error in getCurrentAirQuality: ${err.message}`;

    try {
      console.log("Attempting to send log to logging service...");
      await sendLog(errorMessage);
      console.log("Log successfully sent to logging service.");
    } catch (loggingError) {
      console.error(
        `Failed to send log to logging service: ${loggingError.message || loggingError}`,
      );
    }

    // Always log the error locally, even if logging service fails
    console.error(errorMessage);
    res.status(500).send("Server error");
  }
};

export const saveFavoriteLocation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract and explicitly name locationId
  const {
    name,
    latitude,
    longitude,
    country,
    countryCode,
    state,
    stateCode,
    zip,
    id: locationId,
  } = req.body.location;

  try {
    const favorite = await saveFavoriteQuery({
      userId: req.user.id,
      name,
      latitude,
      longitude,
      locationId,
      country,
      countryCode,
      state,
      stateCode,
      zip,
    });

    res.json(favorite);
  } catch (err) {
    console.error(`Error in saveFavoriteLocation: ${err.message}`);
    res.status(500).send("Server error");
  }
};

export const getFavoriteLocations = async (req, res) => {
  try {
    const favorites = await getFavoriteQuery(req.user.id);
    res.json(favorites);
  } catch (err) {
    console.error(`Error in getFavoriteLocations: ${err.message}`);
    res.status(500).send("Server error");
  }
};

export const deleteFavoriteLocation = async (req, res) => {
  try {
    const favorite = await deleteFavoriteQuery(req.params.id, req.user.id);

    if (!favorite) {
      return res.status(404).json({ msg: "Favorite location not found" });
    }

    res.json({ msg: "Favorite location removed" });
  } catch (err) {
    console.error(`Error in deleteFavoriteLocation: ${err.message}`);
    res.status(500).send("Server error");
  }
};
