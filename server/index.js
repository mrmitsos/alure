const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Stripe webhook needs raw body — must be before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Alure API is running! 🚀" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
