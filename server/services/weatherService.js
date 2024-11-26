import { fetchWeatherApi } from "openmeteo";

const fetchWeather = async (req) => {
  try {
    // Define the base URL and the required parameters for the API call
    const url = "https://api.open-meteo.com/v1/forecast";

    const params = {
      latitude: req.latitude,
      longitude: req.longitude,
      hourly: req.hourly,
      timezone: req.timezone,
      forecast_days: 1,
    };

    // Make the API request using fetchWeatherApi with the specified URL and params
    const responses = await fetchWeatherApi(url, params);

    // Check if any responses were returned
    if (!responses || responses.length === 0) {
      throw new Error("No weather data returned");
    }

    // Process the first response (assuming single location)
    const response = responses[0];

    // Extract necessary data from the response
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly();

    if (!hourly) {
      throw new Error("Hourly data is missing in the response");
    }

    // Helper function to form time ranges
    const range = (start, stop, step) =>
      Array.from(
        { length: Math.ceil((stop - start) / step) },
        (_, i) => start + i * step,
      );

    // Create weather data structure
    const weatherData = {
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval(),
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2m:
          (hourly.variables(0) && hourly.variables(0).valuesArray()) || [],
      },
    };

    // Log the weather data
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      console.log(
        weatherData.hourly.time[i].toISOString(),
        weatherData.hourly.temperature2m[i],
      );
    }

    // Return the structured weather data
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw error;
  }
};

export default fetchWeather;
