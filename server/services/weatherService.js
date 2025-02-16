import { fetchWeatherApi } from "openmeteo";
import { getParameter } from "../utils/getParameter.js";

let url;
try {
  url = await getParameter("/weatheryze/prod/backend/WEATHER_API_URL");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

const airQualityUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";

export const fetchWeather = async (params) => {
  console.log("Using real fetchWeather data");

  try {
    // Ensure hourly parameters are an array
    const hourlyParamsArray = Array.isArray(params.hourly)
      ? params.hourly
      : params.hourly.split(",");

    // Build API parameters dynamically
    const apiParams = {
      latitude: params.latitude,
      longitude: params.longitude,
      temperature_unit: params.temperature_unit || "celsius",
      wind_speed_unit: params.wind_speed_unit || "kmh",
      precipitation_unit: params.precipitation_unit || "mm",
      hourly: hourlyParamsArray,
      timezone: params.timezone,
      timeformat: "unixtime",
      forecast_days: params.forecast_days || 1,
      models: "gfs_global",
    };

    const responses = await fetchWeatherApi(url, apiParams);

    if (!responses || responses.length === 0) {
      throw new Error("No weather data returned");
    }

    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();

    const hourly = response.hourly();

    if (!hourly) {
      throw new Error("Hourly data is missing in the response");
    }

    const range = (start, stop, step) =>
      Array.from(
        { length: Math.floor((stop - start) / step) },
        (_, i) => start + i * step,
      );

    const startTimestamp = Number(hourly.time());
    const endTimestamp = Number(hourly.timeEnd());
    const intervalSeconds = Number(hourly.interval());

    const timeArray = range(startTimestamp, endTimestamp, intervalSeconds).map(
      (t) => new Date((t + utcOffsetSeconds) * 1000),
    );

    // Map API variable names to the application's variable names
    const variableNameMapping = {
      temperature_2m: "temperature2m",
      rain: "rain",
      snowfall: "snowfall",
      windspeed_10m: "windSpeed10m",
      winddirection_10m: "windDirection10m",
      precipitation_probability: "precipitationChance",
      weather_code: "condition",
    };

    // Extract variables dynamically with mapped names
    const variablesData = {};
    for (let i = 0; i < hourly.variablesLength(); i++) {
      const variable = hourly.variables(i);
      const apiVariableName = hourlyParamsArray[i];

      const mappedVariableName =
        variableNameMapping[apiVariableName] || apiVariableName;
      variablesData[mappedVariableName] = variable.valuesArray();
    }

    // Check for weather codes and map them
    if (variablesData.condition) {
      const rawWeatherCodes = Array.from(variablesData.condition);
      variablesData.condition = rawWeatherCodes.map(mapWeatherCodeToCondition);
    }

    // Construct the weather data object
    const weatherData = {
      hourly: {
        time: timeArray,
        ...variablesData,
      },
      utcOffsetSeconds,
      timezone,
    };

    // Convert time entries to ISO strings (if needed)
    weatherData.hourly.time = weatherData.hourly.time.map((date) =>
      date.toISOString(),
    );

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw error;
  }
};

export const fetchCurrentWeather = async (params) => {
  console.log("Using real fetchCurrentWeather data");

  try {
    const apiParams = {
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      temperature_unit: params.temperature_unit,
      wind_speed_unit: params.wind_speed_unit,
      precipitation_unit: params.precipitation_unit,
      models: "gfs_global",
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "apparent_temperature",
      ],
    };

    // Make the API request
    const responses = await fetchWeatherApi(url, apiParams);

    if (!responses || responses.length === 0) {
      throw new Error("No weather data returned");
    }

    const response = responses[0];

    // Extract current weather data using library methods
    const current = response.current();

    if (!current) {
      throw new Error("Current weather data is missing in the response");
    }

    // Map weather variables to readable keys
    const temperature = current.variables(0).value();
    const humidity = current.variables(1).value(); // relative_humidity_2m
    const weatherCode = current.variables(2).value(); // weather_code
    const windSpeed = current.variables(3).value(); // wind_speed_10m
    const windDirection = current.variables(4).value(); // wind_speed_10m
    const apparentTemperature = current.variables(5).value(); // wind_speed_10m

    const condition = mapWeatherCodeToCondition(weatherCode);

    return {
      temperature,
      condition,
      humidity,
      windSpeed,
      windDirection,
      apparentTemperature,
    };
  } catch (error) {
    console.error("Error fetching current weather data:", error.message);
    throw error;
  }
};

export const fetchDailyWeather = async (params) => {
  console.log("Using real fetchDailyWeather data: ");
  try {
    // Build API parameters for current weather
    const apiParams = {
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      temperature_unit: params.temperature_unit,
      wind_speed_unit: params.wind_speed_unit,
      precipitation_unit: params.precipitation_unit,
      models: "gfs_global",
      forecast_days: params.forecast_days || 1,
      daily: params.daily,
    };

    // Make the API request
    const responses = await fetchWeatherApi(url, apiParams);

    if (!responses || responses.length === 0) {
      throw new Error("No weather data returned");
    }

    const response = responses[0];

    // Extract daily weather data using library methods
    const daily = response.daily();
    const timezone = response.timezone();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    if (!daily) {
      throw new Error("Daily weather data is missing in the response");
    }

    // Map weather variables to readable keys
    const temperature2mMin = daily.variables(0).valuesArray(); // relative_humidity_2m
    const temperature2mMax = daily.variables(1).valuesArray();

    return {
      daily: {
        temperature2mMax,
        temperature2mMin,
      },
      utcOffsetSeconds,
      timezone,
    };
  } catch (error) {
    console.error("Error fetching daily weather data:", error.message);
    throw error;
  }
};

// Helper function to map weather codes to readable conditions
const mapWeatherCodeToCondition = (code) => {
  const weatherConditions = {
    Sunny: [0, 1], // Clear sky, mainly clear
    Cloudy: [2, 3], // Partly cloudy, overcast
    Foggy: [45, 48], // Fog and depositing rime fog
    Rainy: [61, 63, 65], // Rain: Slight, moderate, and heavy intensity
    Scattered: [51, 53, 55, 80, 81, 82], // Drizzle and rain showers
    Sleet: [66, 67, 56, 57], // Freezing rain, freezing drizzle
    Snowy: [71, 73, 75, 77, 85, 86], // Snowfall and snow showers
    Thunderstorms: [95, 96, 99], // Thunderstorms (with and without hail)
  };

  for (const [condition, codes] of Object.entries(weatherConditions)) {
    if (codes.includes(code)) {
      return condition;
    }
  }
  return "unknown"; // Fallback
};

export function getUsAqiLabel(aqiValue) {
  if (aqiValue === null || aqiValue === undefined) return "No Data";

  if (aqiValue <= 50) return "Good";
  if (aqiValue <= 100) return "Moderate";
  if (aqiValue <= 150) return "Unhealthy for Sensitive Groups";
  if (aqiValue <= 200) return "Caution";
  if (aqiValue <= 300) return "Unhealthy";
  return "Hazardous"; // for 301–500 or above
}

export async function fetchCurrentAirQuality(params) {
  console.log("Using real fetchCurrentAirQuality data: ");
  const { latitude, longitude, timezone } = params;

  const apiParams = {
    latitude,
    longitude,
    timezone,
    current: [
      "us_aqi_pm2_5",
      "us_aqi_pm10",
      "us_aqi_ozone",
      "us_aqi_sulphur_dioxide",
      "us_aqi_nitrogen_dioxide",
    ],
  };

  const responses = await fetchWeatherApi(airQualityUrl, apiParams);

  if (!responses || responses.length === 0) {
    throw new Error("No air quality data returned from the API.");
  }

  const response = responses[0];
  const current = response.current();

  if (!current) {
    throw new Error("Current air quality data is missing in the response.");
  }

  // Parse the variables in the exact order we requested them in `apiParams.current`
  const pm25Aqi = current.variables(0).value(); // us_aqi_pm2_5
  const pm10Aqi = current.variables(1).value(); // us_aqi_pm10
  const ozoneAqi = current.variables(2).value(); // us_aqi_ozone
  const so2Aqi = current.variables(3).value(); // us_aqi_sulphur_dioxide
  const no2Aqi = current.variables(4).value(); // us_aqi_nitrogen_dioxide

  // Find the "worst" AQI
  const arrOfAQIs = [pm25Aqi, pm10Aqi, ozoneAqi, so2Aqi, no2Aqi].filter(
    (val) => val !== null && val !== undefined,
  );
  const maxAQI = arrOfAQIs.length > 0 ? Math.max(...arrOfAQIs) : null;

  // Convert that max AQI number to a label
  let overallLabel = "No Data";
  if (maxAQI !== null) {
    overallLabel = getUsAqiLabel(maxAQI);
  }

  const detailedBreakdown = {
    pm25: { aqi: pm25Aqi, label: getUsAqiLabel(pm25Aqi) },
    pm10: { aqi: pm10Aqi, label: getUsAqiLabel(pm10Aqi) },
    ozone: { aqi: ozoneAqi, label: getUsAqiLabel(ozoneAqi) },
    so2: { aqi: so2Aqi, label: getUsAqiLabel(so2Aqi) },
    no2: { aqi: no2Aqi, label: getUsAqiLabel(no2Aqi) },
  };

  return {
    overallAQI: maxAQI,
    overallLabel,
    breakdown: detailedBreakdown,
  };
}
