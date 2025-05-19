const User = require('../models/userModel');
const Role = require('../models/roleModel');

// Middleware to check if user has required permissions
// Usage: checkPermissions('perm1', 'perm2', ...)
const checkPermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Fetch user with populated role and permissions
      // Assumes user model has `roleId` referencing Role collection
      const user = await User.findById(userId).populate({
        path: 'roleId',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      });

      if (!user || !user.roleId || !user.roleId.permissions) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Extract permission names of the user
      const userPermissions = user.roleId.permissions.map((perm) => perm.name);

      // Check if user has all required permissions
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      next(); // User has permissions, proceed
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = checkPermissions;
