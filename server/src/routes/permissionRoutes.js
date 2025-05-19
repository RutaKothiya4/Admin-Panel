const express = require("express");
const { validate } = require("../middlewares/validate");
const {
  createPermissionSchema,
} = require("../validation/permissionValidation");
const permissionController = require("../controllers/permissionController");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoutes = require("../middlewares/roleMiddleware");

const router = express.Router();

// Route to create a new permission - accessible only by Super Admin
router.post(
  "/",
  verifyToken, // Verify JWT token to authenticate user
  authorizeRoutes("Super Admin"), // Authorize only Super Admin role
  validate(createPermissionSchema), // Validate request body against schema
  permissionController.createPermission // Controller to handle permission creation
);

// Route to get all permissions - requires authentication
router.get(
  "/",
  verifyToken, // Verify JWT token to authenticate user
  permissionController.getPermissions // Controller to fetch and return permissions
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoutes("Super Admin"),
  permissionController.deletePermission
);

module.exports = router;
