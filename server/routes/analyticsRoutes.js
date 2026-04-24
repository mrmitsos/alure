const express = require("express");
const router = express.Router();
const {
  getOverview,
  getRevenueByMonth,
  getPropertyStats,
  getBookingsByBrand,
  getOccupancyRate,
} = require("../controllers/analyticsController");
const {
  protect,
  hostOnly,
  adminOnly,
} = require("../middleware/authMiddleware");

router.get("/overview", protect, hostOnly, getOverview);
router.get("/revenue", protect, hostOnly, getRevenueByMonth);
router.get("/properties", protect, hostOnly, getPropertyStats);
router.get("/bookings-by-brand", protect, adminOnly, getBookingsByBrand);
router.get("/occupancy", protect, hostOnly, getOccupancyRate);

module.exports = router;
