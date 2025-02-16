import { fetchAllNotifications } from "../services/notificationService.js";
import {
  fetchWeatherData,
  sendMessageToQueue,
} from "../services/processService.js";

const variableNameMapping = {
  temperature2m: "temperature2m",
  rain: "rain",
  snowfall: "snowfall",
  windSpeed10m: "windSpeed10m",
  windDirection10m: "winddirection_10m",
  precipitationChance: "precipitation_probability",
  condition: "weather_code",
};

const getHourlyKey = (type) => {
  switch (type) {
    case "temperature":
      return variableNameMapping.temperature2m;
    case "precipitation":
      return [variableNameMapping.rain, variableNameMapping.snowfall];
    case "snow":
      return variableNameMapping.snowfall;
    case "rain":
      return variableNameMapping.rain;
    case "windSpeed":
      return variableNameMapping.windSpeed10m;
    default:
      throw new Error(`Unsupported notification type: ${type}`);
  }
};

export const processNotifications = async (req, res) => {
  try {
    const notifications = await fetchAllNotifications();

    for (const notification of notifications) {
      const {
        latitude,
        longitude,
        threshold,
        comparator,
        email,
        location,
        type,
        range,
      } = notification;

      const weatherData = await fetchWeatherData({
        latitude,
        longitude,
        type,
        range,
      });

      const hourlyKey = getHourlyKey(type);

      let hourlyData;
      if (type === "rain" || type === "snow") {
        const precipitationKey = type === "rain" ? "rain" : "snowfall";
        hourlyData = weatherData.hourly[precipitationKey];
      } else {
        hourlyData = Array.isArray(hourlyKey)
          ? hourlyKey.map((key) => weatherData.hourly[key])
          : weatherData.hourly[hourlyKey];
      }

      let sendAlert = false;
      let exceededValue = null;

      // Check the data against the threshold
      if (Array.isArray(hourlyData)) {
        for (const dataArray of hourlyData) {
          const exceedingValue = Object.values(dataArray).find((value) =>
            comparator === ">" ? value > threshold : value < threshold,
          );
          if (exceedingValue !== undefined) {
            exceededValue = exceedingValue;
            sendAlert = true;
            break;
          }
        }
      } else if (typeof hourlyData === "object" && hourlyData !== null) {
        const exceedingValue = Object.values(hourlyData).find((value) =>
          comparator === ">" ? value > threshold : value < threshold,
        );
        if (exceedingValue !== undefined) {
          exceededValue = exceedingValue;
          sendAlert = true;
        }
      } else {
        console.error("Unexpected structure for hourlyData: ", hourlyData);
      }

      if (sendAlert) {
        const message = JSON.stringify({
          email,
          subject: `Weather Alert for ${location}`,
          body: `Alert: ${type} ${comparator} ${threshold}. Current value: ${exceededValue}`,
        });

        await sendMessageToQueue("alerts", message);
        console.log(`Notification queued: ${message}`);
      }
    }

    res.status(200).json({ message: "Notifications processed successfully." });
  } catch (error) {
    console.error("Error processing notifications:", error);
    res.status(500).json({ message: "Error processing notifications." });
  }
};
