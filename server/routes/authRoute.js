import express from "express";
import { check } from "express-validator";
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
} from "../controllers/authController.js"; // Import named exports
import auth from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  registerUser,
);

// @route   POST /api/auth/login
// @desc    Log in a user
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginUser,
);

// @route   GET /api/auth/user
// @desc    Get authenticated user's profile
// @access  Private
router.get("/user", auth, getAuthenticatedUser);

export default router;
