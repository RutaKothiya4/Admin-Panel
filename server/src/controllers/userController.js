const User = require("../models/userModel");

// Get all Super Admin usernames
const admin = async (req, res) => {
  try {
    // Find admin with role "Super Admin"
    const admins = await User.find({ role: "Super Admin" }).select(
      "_id username refreshTokens"
    );

    // Return full objects, not just usernames
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins, // array of { _id, username, refreshTokens}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Get all Manager usernames
const manager = async (req, res) => {
  try {
    // Find managers with role "Manager"
    const managers = await User.find({ role: "Manager" }).select(
      "_id username refreshTokens"
    );

    // Return full objects, not just usernames
    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers, // array of { _id, username, refreshTokens}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all User usernames
const users = async (req, res) => {
  try {
    // Find users with role "User"
    const users = await User.find({ role: "User" }).select(
      "_id username refreshTokens"
    );

    // Return full objects, not just usernames
    res.status(200).json({
      success: true,
      count: users.length,
      data: users, // array of { _id, username, refreshTokens}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  admin,
  manager,
  users,
};
