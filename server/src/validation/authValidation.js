const Joi = require("joi");

// Schema to validate user registration input
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(), // Username: alphanumeric, 3-30 chars
  password: Joi.string().min(6).required(), // Password: minimum 6 characters
  role: Joi.string().valid("Super Admin", "Manager", "User").optional(), // Optional role with allowed values
});

// Schema to validate user login input
const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(), // Username: alphanumeric, 3-30 chars
  password: Joi.string().min(6).required(), // Password: minimum 6 characters
});

module.exports = {
  registerSchema,
  loginSchema,
};
