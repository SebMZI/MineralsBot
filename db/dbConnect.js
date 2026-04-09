const mongoose = require("mongoose");
const log = require("../utils/logs.js");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database successfully!");
    log("Database connection established successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    log(`[ERROR] Failed to connect to database: ${error.message}`);
  }
}

module.exports = { connectToDatabase };
