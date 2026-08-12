const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const waitlistRoutes = require("./routes/waitlist");
const attendanceRoutes = require("./routes/attendance");

const app = express();

// CORS — allow frontend origins
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://kalvian.tech",
    "https://www.kalvian.tech",
    "https://app.kalvium.community",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
}));

app.use(express.json());

// Database connection (MongoDB for waitlist)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✓ MongoDB connected"))
    .catch(err => console.error("✗ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️ MONGO_URI missing in .env. MongoDB (Waitlist) will not work.");
}

// Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "kalvian.tech API" });
});

app.use("/api/waitlist", waitlistRoutes);
app.use("/api/attendance", attendanceRoutes);

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));