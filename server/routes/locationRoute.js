import express from "express";
import {
  getLocationByCoordinates,
  suggestLocations,
} from "../controllers/locationController.js";

const router = express.Router();

// @route   GET /api/location/suggest
// @desc    Suggest locations
// @access  Public
router.get("/suggest", suggestLocations);

// @route   GET /api/location/coordinates
// @desc    Get location details by latitude and longitude
// @access  Public
router.get("/coordinates", getLocationByCoordinates);

export default router;
