// Mongoose schema and model for Users with unique username, hashed password, assigned role and role reference,
// plus refresh token management for session handling and security.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Super Admin", "Manager", "User"],
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        valid: { type: Boolean, default: true },
        expiresAt: { type: Date, required: true },
        sessionId: { type: String, required: true },
        ipAddress: { type: String, required: true },
        userAgent: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
