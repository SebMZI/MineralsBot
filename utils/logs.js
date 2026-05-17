// utils/logs.js
const fs = require("fs").promises;
const path = require("path");

// Path to the log file relative to this file
const logFilePath = path.join(__dirname, "../logs/logs.txt");
const logDir = path.dirname(logFilePath);

/**
 * Writes a log message to logs/logs.txt
 * @param {string} message - The message to log
 */
async function log(message) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;

  try {
    // Ensure the logs directory exists
    await fs.mkdir(logDir, { recursive: true });

    // Append the log message to logs.txt
    await fs.appendFile(logFilePath, logMessage);
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}

module.exports = log;