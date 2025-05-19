const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    // Connect to local MongoDB database named 'rbacdb'
    await mongoose.connect(
      process.env.MONGODB_URL || "mongodb://localhost:27017/rbacdb",
      {
        // useNewUrlParser and useUnifiedTopology are enabled by default in recent mongoose versions
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = dbConnect;
