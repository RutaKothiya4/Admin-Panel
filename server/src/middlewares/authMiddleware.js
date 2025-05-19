const jwt = require("jsonwebtoken");

// Middleware to verify JWT token from Authorization header
const verifyToken = (req, res, next) => {
  let token;

  // Get token from Authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract token after 'Bearer '

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // Verify token using secret key
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "eCGSHHNIKN5bxshedkisbkruin43tegd"
      );
      req.user = decoded; // Attach decoded payload to req.user

      next();
    } catch (error) {
      return res.status(400).json({ message: "Token is not valid" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = verifyToken;
