const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const waitlistRoutes = require("./routes/waitlist");

const app = express();

// CORS — allow frontend origins
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://kalvian.tech",
    "https://www.kalvian.tech",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB connected"))
  .catch(err => console.error("✗ MongoDB connection error:", err.message));

// Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "kalvian.tech API" });
});

app.use("/api/waitlist", waitlistRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));