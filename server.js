// Live MOTD server for Volcano - By Light.
// Run locally:  node server.js   → http://localhost:3000
// Deploy free:  push to a new GitHub repo, then deploy on https://render.com
//               (Web Service, build: "npm install", start: "node server.js")
//
// Unity fetches GET /motd → { "text": "..." }
// Admin page at / lets you edit it (password below).

const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_FILE = path.join(__dirname, "motd.json");

if (!ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_PASSWORD environment variable is required.");
  console.error("  Locally:  set ADMIN_PASSWORD=yourpassword && node server.js");
  console.error("  Render:   add ADMIN_PASSWORD in Environment Variables");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readMotd() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { text: "Welcome to Volcano - By Light!", updated: null };
  }
}

function writeMotd(text) {
  const data = { text, updated: new Date().toISOString() };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return data;
}

app.get("/motd", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readMotd());
});

app.post("/motd", (req, res) => {
  const { password, text } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }
  if (typeof text !== "string" || text.length > 500) {
    return res.status(400).json({ error: "Text must be a string under 500 chars" });
  }
  res.json(writeMotd(text));
});

app.listen(PORT, () => {
  console.log(`Live MOTD running on port ${PORT}`);
});
