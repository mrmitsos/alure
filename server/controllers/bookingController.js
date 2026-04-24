const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper — check if dates overlap
const hasOverlap = (existingBookings, checkIn, checkOut) => {
  return existingBookings.some((booking) => {
    return (
      (checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
      (checkOut > booking.checkIn && checkOut <= booking.checkOut) ||
      (checkIn <= booking.checkIn && checkOut >= booking.checkOut)
    );
  });
};

// @route POST /api/bookings
// @access Guest only
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    const property = await Property.findById(propertyId).populate("host");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (guests > property.maxGuests) {
      return res
        .status(400)
        .json({ message: `Maximum guests allowed is ${property.maxGuests}` });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res
        .status(400)
        .json({ message: "Check out must be after check in" });
    }

    if (checkInDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Check in must be in the future" });
    }

    const existingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ["pending", "confirmed"] },
    });

    if (hasOverlap(existingBookings, checkInDate, checkOutDate)) {
      return res
        .status(400)
        .json({ message: "Property is not available for these dates" });
    }

    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      guest: req.user._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
    });

    // Get guest info
    const guest = await User.findById(req.user._id);

    const checkInFormatted = checkInDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const checkOutFormatted = checkOutDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // ── Email to Guest ──────────────────────────────────────────────
    await resend.emails.send({
      from: "Alure <onboarding@resend.dev>",
      to: guest.email,
      subject: `Booking Confirmed — ${property.title} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <div style="background: #1e293b; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed! 🎉</h1>
          </div>
          <div style="padding: 32px;">
            <p>Hi <strong>${guest.name}</strong>,</p>
            <p>Your booking request has been received and is pending confirmation from the host.</p>

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
                  <td style="color: #64748b; padding: 4px 0;">Guests</td>
                  <td style="font-weight: bold; text-align: right;">${guests}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Nights</td>
                  <td style="font-weight: bold; text-align: right;">${nights}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0; border-top: 1px solid #e2e8f0;">Total</td>
                  <td style="font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">€${totalPrice}</td>
                </tr>
              </table>
            </div>

            <p style="color: #64748b; font-size: 14px;">
              Your booking is currently <strong>pending payment</strong>. 
              Complete your payment to confirm the reservation.
            </p>
            <p style="color: #64748b; font-size: 14px;">The Alure Team 🏔️🏝️</p>
          </div>
        </div>
      `,
    });

    // ── Email to Host ───────────────────────────────────────────────
    await resend.emails.send({
      from: "Alure <onboarding@resend.dev>",
      to: property.host.email,
      subject: `New Booking Request — ${property.title} 📅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <div style="background: #1e293b; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Booking Request 📅</h1>
          </div>
          <div style="padding: 32px;">
            <p>Hi <strong>${property.host.name}</strong>,</p>
            <p>You have a new booking request for <strong>${property.title}</strong>.</p>

            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Guest</td>
                  <td style="font-weight: bold; text-align: right;">${guest.name}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Email</td>
                  <td style="font-weight: bold; text-align: right;">${guest.email}</td>
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
                  <td style="color: #64748b; padding: 4px 0;">Guests</td>
                  <td style="font-weight: bold; text-align: right;">${guests}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0; border-top: 1px solid #e2e8f0;">Total</td>
                  <td style="font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">€${totalPrice}</td>
                </tr>
              </table>
            </div>

            <p style="color: #64748b; font-size: 14px;">
              Log in to your dashboard to confirm or manage this booking.
            </p>
            <p style="color: #64748b; font-size: 14px;">The Alure Team 🏔️🏝️</p>
          </div>
        </div>
      `,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/bookings
// @access Admin/Host only
const getAllBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "admin") {
      // Admin sees all bookings
      bookings = await Booking.find()
        .populate("guest", "name email")
        .populate("property", "title brand location pricePerNight")
        .sort({ createdAt: -1 });
    } else {
      // Host sees only their property bookings
      const hostProperties = await Property.find({ host: req.user._id });
      const propertyIds = hostProperties.map((p) => p._id);

      bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate("guest", "name email")
        .populate("property", "title brand location pricePerNight")
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/bookings/my
// @access Guest only
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate("property", "title brand location images pricePerNight")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/bookings/:id
// @access Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("guest", "name email phone")
      .populate("property", "title brand location images pricePerNight");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only guest, host or admin can see the booking
    const property = await Property.findById(booking.property);
    const isGuest = booking.guest._id.toString() === req.user._id.toString();
    const isHost = property.host.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route PUT /api/bookings/:id/status
// @access Host/Admin only
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/bookings/availability/:propertyId
// @access Public
const checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const { propertyId } = req.params;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const existingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ["pending", "confirmed"] },
    });

    const available = !hasOverlap(existingBookings, checkInDate, checkOutDate);

    res.json({ available });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/bookings/booked-dates/:propertyId
// @access Public
const getBookedDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      property: req.params.propertyId,
      status: { $in: ["pending", "confirmed"] },
    });

    // Generate all booked dates from booking ranges
    const bookedDates = [];
    bookings.forEach((booking) => {
      const current = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      while (current <= end) {
        bookedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    res.json(bookedDates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  checkAvailability,
  getBookedDates,
};
