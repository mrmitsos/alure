const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  checkAvailability,
  getBookedDates,
} = require("../controllers/bookingController");
const { protect, hostOnly } = require("../middleware/authMiddleware");

router.get("/availability/:propertyId", checkAvailability);
router.get("/my", protect, getMyBookings);
router.get("/", protect, hostOnly, getAllBookings);
router.get("/:id", protect, getBookingById);
router.post("/", protect, createBooking);
router.put("/:id/status", protect, hostOnly, updateBookingStatus);
router.get("/booked-dates/:propertyId", getBookedDates);

module.exports = router;
