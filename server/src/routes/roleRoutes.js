const express = require("express");
const { validate } = require("../middlewares/validate");
const {
  createRoleSchema,
  assignPermissionsSchema,
} = require("../validation/roleValidation");
const roleController = require("../controllers/roleController");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoutes = require("../middlewares/roleMiddleware");
const { deleteUser, revokeSession } = require("../controllers/authController");

// Router for role-related endpoints
// Only Super Admin can create roles and assign permissions to roles

const router = express.Router();

// Create a new role - accessible only by Super Admin
router.post(
  "/",
  verifyToken, // Authenticate user via JWT
  authorizeRoutes("Super Admin"), // Authorize Super Admin role only
  validate(createRoleSchema), // Validate request body using schema
  roleController.createRole // Controller logic to create role
);

// Get all roles - requires authentication but no role restriction
router.get(
  "/",
  verifyToken, // Authenticate user
  authorizeRoutes("Super Admin"), // Authorize Super Admin only
  roleController.getRoles // Controller to fetch all roles with permissions
);

router.get("/:name", verifyToken, roleController.findRole);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoutes("Super Admin"),
  roleController.deleteRole
);

router.delete(
  "/deleteUser/:id",
  verifyToken,
  authorizeRoutes("Super Admin"),
  deleteUser
);

router.post(
  "/revoke-session",
  verifyToken,
  authorizeRoutes("Super Admin"),
  revokeSession
);

// Assign permissions to a role - accessible only by Super Admin
router.post(
  "/assign-permissions",
  verifyToken, // Authenticate user
  authorizeRoutes("Super Admin"), // Authorize Super Admin only
  validate(assignPermissionsSchema), // Validate request body
  roleController.assignPermissionsToRole // Controller to update role permissions
);

module.exports = router;
