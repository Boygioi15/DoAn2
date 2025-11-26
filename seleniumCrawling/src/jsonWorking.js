const fs = require("fs");
const path = require("path");

// Ensure folder exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load existing JSON or return empty object
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Failed to parse JSON file:", filePath, err);
    return {};
  }
}

// Save updated JSON
function saveJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { ensureDir, loadJson, saveJson };
