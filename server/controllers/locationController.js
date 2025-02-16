import axios from "axios";
import { sendLog } from "../utils/logging.js";

const envlocationServiceUrl =
  process.env.NODE_ENV === "production"
    ? "location-service"
    : "location-service";

// @desc    Suggest locations
// @route   GET /api/location/suggest
// @access  Public
export const suggestLocations = async (req, res) => {
  const { query, limit = 5 } = req.query;

  if (!query) {
    await sendLog("Missing search query in suggestLocations endpoint", "WARN");
    return res.status(400).json({ msg: "Search query is required" });
  }

  try {
    await sendLog(
      `Received request for suggestLocations: query="${query}", limit=${limit}`,
      "INFO",
    );
    const response = await axios.get(
      `http://${envlocationServiceUrl}:5003/api/v1/location-service/location/suggest`,
      {
        params: { query, limit },
      },
    );
    await sendLog(
      `suggestLocations succeeded: query="${query}", returned ${
        response.data.length
      } locations`,
      "INFO",
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error in suggestLocations:", err);
    try {
      await sendLog(
        `Error in suggestLocations: query="${query}", error="${err.message}"`,
        "ERROR",
      );
    } catch (logErr) {
      console.error("Failed to send log to logging service:", logErr);
    }
    res.status(500).send("Server error");
  }
};

// @desc    Get location details by latitude and longitude
// @route   GET /api/location/coordinates
// @access  Public
export const getLocationByCoordinates = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ msg: "Latitude and longitude are required." });
  }

  try {
    const response = await axios.get(
      `http://${envlocationServiceUrl}:5003/api/v1/location-service/location/coordinates`,
      {
        params: { latitude, longitude },
      },
    );

    res.status(200).json(response.data);
  } catch (err) {
    if (err.message === "Location not found") {
      return res.status(404).json({ msg: err.message });
    }

    console.error(err.message);
    res.status(500).json({ msg: "Failed to fetch location by coordinates." });
  }
};
