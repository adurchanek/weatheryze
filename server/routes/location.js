import express from "express";
import { suggestLocations } from "../controllers/locationController.js";

const router = express.Router();

// @route   GET /api/location/suggest
// @desc    Suggest locations
// @access  Public
router.get("/suggest", suggestLocations);

export default router;
