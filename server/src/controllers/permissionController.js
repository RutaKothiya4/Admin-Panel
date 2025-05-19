const Permission = require("../models/permissionModel");
const User = require("../models/userModel");

// Create a new permission (Super Admin only)
exports.createPermission = async (req, res, next) => {
  try {
    // Fetch the logged-in user
    const user = await User.findById(req.user.id);

    // Restrict access to Super Admin role only
    if (user.role !== "Super Admin") {
      return res.status(403).json({
        message: "Access denied: Only Super Admin can create permissions",
      });
    }

    const { name, description } = req.body;

    // Check if permission with same name exists (case-insensitive)
    const existing = await Permission.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({ message: "Permission already exists" });
    }

    // Create and save new permission
    const permission = await Permission.create({ name, description });

    res.status(201).json({ message: "Permission created", data: permission });
  } catch (err) {
    next(err);
  }
};

// Get all permissions
exports.getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find();
    res.json({ data: permissions });
  } catch (err) {
    next(err);
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const permissionId = req.params.id;
    const deleted = await Permission.findByIdAndDelete(permissionId);

    if (!deleted) {
      return res.status(404).json({ message: "Permission not found" });
    }

    return res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Delete Permission error:", error);
    return res
      .status(500)
      .json({ message: "Server error deleting permission" });
  }
};
