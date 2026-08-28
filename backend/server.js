import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
