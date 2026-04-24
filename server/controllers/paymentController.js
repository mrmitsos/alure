const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Property = require("../models/Property");

// @route POST /api/payments/create-checkout-session
// @access Guest only
const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("property");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Calculate platform fee
    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 10;
    const platformFee = Math.round(
      booking.totalPrice * (platformFeePercent / 100) * 100,
    );
    const totalAmount = Math.round(booking.totalPrice * 100); // convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: booking.property.title,
              description: `Check in: ${booking.checkIn.toDateString()} → Check out: ${booking.checkOut.toDateString()}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/cancel`,
      metadata: {
        bookingId: bookingId,
        guestId: req.user._id.toString(),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/payments/webhook
// @access Stripe only
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const booking = await Booking.findById(
        session.metadata.bookingId,
      ).populate("property");

      if (booking) {
        // Update booking status
        booking.status = "confirmed";
        booking.paymentStatus = "paid";
        booking.paymentId = session.payment_intent;
        await booking.save();

        // Calculate fees
        const platformFeePercent =
          Number(process.env.PLATFORM_FEE_PERCENT) || 10;
        const platformFee = booking.totalPrice * (platformFeePercent / 100);
        const hostPayout = booking.totalPrice - platformFee;

        // Create payment record
        await Payment.create({
          booking: booking._id,
          guest: session.metadata.guestId,
          host: booking.property.host,
          amount: booking.totalPrice,
          platformFee,
          hostPayout,
          currency: "eur",
          stripePaymentIntentId: session.payment_intent,
          status: "completed",
        });
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  res.json({ received: true });
};

// @route GET /api/payments/booking/:bookingId
// @access Host/Admin only
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate("guest", "name email")
      .populate("booking");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/payments
// @access Admin only
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("guest", "name email")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  getPaymentByBooking,
  getAllPayments,
};
