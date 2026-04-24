const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  stripeWebhook,
  getPaymentByBooking,
  getAllPayments,
} = require("../controllers/paymentController");
const {
  protect,
  hostOnly,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/webhook", stripeWebhook);
router.get("/booking/:bookingId", protect, hostOnly, getPaymentByBooking);
router.get("/", protect, adminOnly, getAllPayments);

module.exports = router;
