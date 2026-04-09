const fs = require("fs").promises;
const path = require("path");

const logFilePath = path.join(__dirname, "../logs/logs.txt");
const logDir = path.dirname(logFilePath);

async function log(message) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;

  try {
    await fs.mkdir(logDir, { recursive: true });

    await fs.appendFile(logFilePath, logMessage + "\n");
  } catch (error) {
    console.error("Failed to write log :", error);
  }
}

module.exports = log;
