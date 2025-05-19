// Express router for authentication routes including user registration, login, token refresh, logout, and session revocation.
// Uses validation middleware to validate incoming requests for register and login endpoints.
const express = require("express");
const {
  register,
  login,
  refreshAccessToken,
  logout,
} = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const { registerSchema, loginSchema } = require("../validation/authValidation");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

module.exports = router;
