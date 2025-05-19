// controllers/authController.js
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
  // isValidRefreshToken,   // keep if you use it elsewhere
} = require("../utils/tokenUtils");

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

// One‑stop shop: keep only tokens that are still valid
const pruneInvalidTokens = (user) => {
  user.refreshTokens = user.refreshTokens.filter((t) => t.valid);
};

// Hash password with SHA‑256, salt, and 10 000 iterations
const hashPasswordSHA256 = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10_000, 64, "sha256")
    .toString("hex");
  return { hash, salt };
};

/* -------------------------------------------------------------------------- */
/*  Auth Controllers                                                          */
/* -------------------------------------------------------------------------- */

// ───────────────────────────────── Register ──────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username & password required" });
    }

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { hash, salt } = hashPasswordSHA256(password);

    const newUser = await User.create({
      username,
      password: hash,
      salt,
      role: role || "User",
    });

    res.status(201).json({
      message: `User registered with username: ${username}`,
      newUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ────────────────────────────────── Login ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedInput = crypto
      .pbkdf2Sync(password, user.salt, 10_000, 64, "sha256")
      .toString("hex");

    if (hashedInput !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Clean up any old invalid tokens first
    pruneInvalidTokens(user);

    // Create new session
    const sessionId = uuidv4();
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      valid: true,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await user.save();

    // Map minimal session data to return
    const sessions = user.refreshTokens.map(
      ({ sessionId, ipAddress, userAgent, expiresAt }) => ({
        sessionId,
        ipAddress,
        userAgent,
        expiresAt,
      })
    );

    res.status(200).json({
      accessToken: generateAccessToken(user),
      refreshToken,
      sessionId,
      sessions,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: `Login failed: ${err}` });
  }
};

// ───────────────────────────── Refresh Access Token ──────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken, sessionId, ipAddress, userAgent } = req.body;
    if (!refreshToken || !sessionId || !ipAddress || !userAgent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tokenObj = user.refreshTokens.find(
      (t) => t.token === refreshToken && t.sessionId === sessionId
    );

    if (!tokenObj || !tokenObj.valid) {
      return res.status(403).json({ message: "Invalid or expired session" });
    }

    if (tokenObj.ipAddress !== ipAddress || tokenObj.userAgent !== userAgent) {
      return res.status(403).json({ message: "Session hijacking detected" });
    }

    pruneInvalidTokens(user);
    await user.save();

    res
      .status(200)
      .json({ accessToken: generateAccessToken(user) });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: `Token refresh failed: ${err}` });
  }
};

// ────────────────────────────────── Logout ───────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken, sessionId } = req.body;
    if (!refreshToken || !sessionId) {
      return res
        .status(400)
        .json({ message: "Refresh token and session ID are required" });
    }

    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Session not found or already logged out" });
    }

    const tokenObj = user.refreshTokens.find(
      (t) => t.token === refreshToken && t.sessionId === sessionId
    );
    if (!tokenObj) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    tokenObj.valid = false;

    // Clean up + persist
    pruneInvalidTokens(user);
    await user.save();

    res.status(200).json({
      message: "Logged out successfully",
      sessions: user.refreshTokens, // active only
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error while logging out", err });
  }
};

// ─────────────────────────────── Revoke Session ──────────────────────────────
const revokeSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId || !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID and session ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.refreshTokens.findIndex((t) => t.sessionId === sessionId);
    if (idx === -1) {
      return res.status(404).json({ message: "Session not found" });
    }

    user.refreshTokens.splice(idx, 1); // hard delete
    pruneInvalidTokens(user);
    await user.save();

    res.status(200).json({
      message: "Session revoked successfully",
      sessions: user.refreshTokens,
    });
  } catch (err) {
    console.error("Revoke session error:", err);
    res.status(500).json({ message: "Error revoking session", err });
  }
};

// ───────────────────────────────── Delete User ───────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
};

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  revokeSession,
  deleteUser,
};
