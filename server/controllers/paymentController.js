const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Property = require("../models/Property");
const User = require("../models/User");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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
        // Auto confirm after successful payment
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

        // Send confirmation email to guest
        const guest = await User.findById(session.metadata.guestId);
        const property = booking.property;

        const checkInFormatted = booking.checkIn.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const checkOutFormatted = booking.checkOut.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const nights = Math.ceil(
          (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24),
        );

        // Email to guest
        await resend.emails.send({
          from: "Alure <onboarding@resend.dev>",
          to: guest.email,
          subject: `Payment Confirmed — ${property.title} ✅`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e293b; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Payment Confirmed! ✅</h1>
            </div>
            <div style="padding: 32px;">
              <p>Hi <strong>${guest.name}</strong>,</p>
              <p>Your payment was successful and your booking is now <strong>confirmed</strong>!</p>

              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h2 style="margin: 0 0 16px; font-size: 18px;">${property.title}</h2>
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  📍 ${property.location.city}, ${property.location.region}
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Check In</td>
                    <td style="font-weight: bold; text-align: right;">${checkInFormatted}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Check Out</td>
                    <td style="font-weight: bold; text-align: right;">${checkOutFormatted}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Nights</td>
                    <td style="font-weight: bold; text-align: right;">${nights}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0; border-top: 1px solid #e2e8f0;">Total Paid</td>
                    <td style="font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">€${booking.totalPrice}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #64748b; font-size: 14px;">
                We look forward to welcoming you! 🏔️🏝️
              </p>
              <p style="color: #64748b; font-size: 14px;">The Alure Team</p>
            </div>
          </div>
        `,
        });

        // Email to host
        await resend.emails.send({
          from: "Alure <onboarding@resend.dev>",
          to: property.host.email,
          subject: `Booking Confirmed + Payment Received — ${property.title} 💰`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e293b; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received! 💰</h1>
            </div>
            <div style="padding: 32px;">
              <p>Hi <strong>${property.host.name}</strong>,</p>
              <p>A booking for <strong>${property.title}</strong> has been confirmed and payment received.</p>

              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Guest</td>
                    <td style="font-weight: bold; text-align: right;">${guest.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Check In</td>
                    <td style="font-weight: bold; text-align: right;">${checkInFormatted}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Check Out</td>
                    <td style="font-weight: bold; text-align: right;">${checkOutFormatted}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Total Amount</td>
                    <td style="font-weight: bold; text-align: right;">€${booking.totalPrice}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0;">Platform Fee</td>
                    <td style="font-weight: bold; text-align: right; color: #ef4444;">-€${platformFee}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 4px 0; border-top: 1px solid #e2e8f0;">Your Payout</td>
                    <td style="font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0; color: #22c55e;">€${hostPayout}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #64748b; font-size: 14px;">
                Log in to your dashboard to manage this booking.
              </p>
              <p style="color: #64748b; font-size: 14px;">The Alure Team</p>
            </div>
          </div>
        `,
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
