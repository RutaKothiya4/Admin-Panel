const Joi = require("joi");
const mongoose = require("mongoose");

// Custom Joi validation to check for valid MongoDB ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid"); // Return validation error if not valid ObjectId
  }
  return value; // Valid ObjectId, return value unchanged
};

exports.createRoleSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(), // Role name: required string between 3 and 50 chars
  permissions: Joi.array()
    .items(Joi.string().custom(objectId)) // Array of permission ObjectIds (optional)
    .optional(),
});

exports.assignPermissionsSchema = Joi.object({
  roleId: Joi.string().custom(objectId).required(), // Role ObjectId to assign permissions to (required)
  permissions: Joi.array()
    .items(Joi.string().custom(objectId)) // Array of permission ObjectIds (required)
    .required(),
});
