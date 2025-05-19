// Middleware to validate request body against a Joi schema
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // If validation fails, send 400 with error message
      return res.status(400).json({ message: error.message });
    }
    next(); // Proceed if validation passes
  };
};
