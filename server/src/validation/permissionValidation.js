const Joi = require("joi");

// Validation schema for creating a new permission
exports.createPermissionSchema = Joi.object({
  name: Joi.string().min(3).required(), // Permission name, at least 3 characters, required
  description: Joi.string().optional(), // Optional description of the permission
});
