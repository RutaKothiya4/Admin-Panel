// Middleware to restrict route access based on user roles
// Usage: authorizeRoutes('Admin', 'Super Admin', ...)
const authorizeRoutes = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user's role is among allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = authorizeRoutes;
