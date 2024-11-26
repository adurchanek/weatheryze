import fetchLocations from "../services/locationService.js";

// @desc    Suggest locations
// @route   GET /api/location/suggest
// @access  Public
export const suggestLocations = async (req, res) => {
  const { query, limit = 5 } = req.query;

  if (!query) {
    return res.status(400).json({ msg: "Search query is required" });
  }

  try {
    const suggestedLocations = await fetchLocations(query);
    const locations = suggestedLocations.slice(0, limit);
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
