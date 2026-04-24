const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    hostPayout: { type: Number, required: true },
    currency: { type: String, default: "eur" },
    stripePaymentIntentId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
