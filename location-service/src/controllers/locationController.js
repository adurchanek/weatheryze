import {
  fetchLocation,
  fetchLocationByCoordinates,
} from "../services/locationService.js";

export const suggestLocations = async (req, res) => {
  const { query, limit = 5 } = req.query;

  if (!query) {
    return res.status(400).json({ msg: "Search query is required" });
  }

  try {
    const suggestedLocations = await fetchLocation(query);
    const locations = suggestedLocations.slice(0, limit);
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const getLocationByCoordinates = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ msg: "Latitude and longitude are required." });
  }

  try {
    const location = await fetchLocationByCoordinates(latitude, longitude);
    res.status(200).json(location);
  } catch (err) {
    if (err.message === "Location not found") {
      return res.status(404).json({ msg: err.message });
    }

    res.status(500).json({ msg: "Failed to fetch location by coordinates." });
  }
};
