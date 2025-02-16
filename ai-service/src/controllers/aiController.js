import { summarizeWeatherData } from "../services/aiService.js";

export const summarizeWeather = async (req, res) => {
  const { weatherData, units = "metric", location } = req.body;

  if (!weatherData || !location) {
    return res
      .status(400)
      .json({ msg: "Weather Data and location are required" });
  }

  try {
    const summarizedWeather = await summarizeWeatherData(
      weatherData,
      units,
      location,
    );
    res.status(200).json(summarizedWeather);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
