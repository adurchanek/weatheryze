import express from "express";
import {
  suggestLocations,
  getLocationByCoordinates,
} from "../controllers/locationController.js";

const router = express.Router();

router.get("/suggest", suggestLocations);
router.get("/coordinates", getLocationByCoordinates);

export default router;
