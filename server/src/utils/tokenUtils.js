const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "eCGSHHNIKN5bxshedkisbkruin43tegd",
    { expiresIn: "15m" } // Access token expires in 15 minutes
  );
};

// Generate Refresh Token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

// Validate the Refresh Token
const isValidRefreshToken = async (user, refreshToken) => {
  if (!user || !refreshToken) return false;

  const tokenObj = user.refreshTokens.find(
    (token) => token.token === refreshToken
  );
  if (!tokenObj) return false;

  if (new Date() > new Date(tokenObj.expiresAt)) return false;

  if (!tokenObj.valid) return false;

  return true;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isValidRefreshToken,
};
