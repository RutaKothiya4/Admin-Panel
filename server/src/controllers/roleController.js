const Role = require("../models/roleModel");
const User = require("../models/userModel");

// Create a new role (Super Admin only)
exports.createRole = async (req, res, next) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.user.id);

    // Restrict access to Super Admin
    if (!user || user.role !== "Super Admin") {
      return res
        .status(403)
        .json({ message: "Access denied: Only Super Admin can create roles" });
    }

    const { name, permissions } = req.body;

    // Check if role already exists (case-insensitive)
    const existing = await Role.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({ message: "Role already exists" });
    }

    // Create new role with permissions
    const role = await Role.create({ name, permissions });

    res.status(201).json({ message: "Role created", data: role });
  } catch (err) {
    next(err);
  }
};

// Assign permissions to a role (Super Admin only)
exports.assignPermissionsToRole = async (req, res, next) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.user.id);

    const { roleId, permissions } = req.body;

    // Update role's permissions and return updated role with populated permissions
    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions },
      { new: true }
    ).populate("permissions");

    res.json({ message: "Permissions assigned", data: role });
  } catch (err) {
    next(err);
  }
};

// Get all roles with their permissions
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().populate("permissions");

    res.json({ data: roles });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const deleted = await Role.findByIdAndDelete(roleId);

    if (!deleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete Role error:", error);
    return res.status(500).json({ message: "Server error deleting role" });
  }
};

exports.findRole = async (req, res) => {
  try {
    const roleName = req.params.name;
    const findRole = await Role.findOne({ name: roleName }).populate("permissions");

    if (!findRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json(findRole);
  } catch (error) {
    console.error("Find Role error:", error);
    return res.status(500).json({ message: "Server error finding role" });
  }
};
