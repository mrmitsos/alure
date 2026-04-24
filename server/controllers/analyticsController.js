const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Payment = require("../models/Payment");
const User = require("../models/User");

// @route GET /api/analytics/overview
// @access Host/Admin
const getOverview = async (req, res) => {
  try {
    let propertyFilter = {};
    let bookingFilter = {};

    // If host, only show their data
    if (req.user.role === "host") {
      const hostProperties = await Property.find({ host: req.user._id });
      const propertyIds = hostProperties.map((p) => p._id);
      propertyFilter = { _id: { $in: propertyIds } };
      bookingFilter = { property: { $in: propertyIds } };
    }

    // Total properties
    const totalProperties = await Property.countDocuments(propertyFilter);

    // Total bookings
    const totalBookings = await Booking.countDocuments(bookingFilter);

    // Total revenue
    const revenueData = await Payment.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "bookingData",
        },
      },
      { $unwind: "$bookingData" },
      ...(req.user.role === "host"
        ? [
            {
              $match: {
                "bookingData.property": {
                  $in: Object.values(bookingFilter)[0]?.$in || [],
                },
              },
            },
          ]
        : []),
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalHostPayout: { $sum: "$hostPayout" },
        },
      },
    ]);

    // Total guests
    const totalGuests = await User.countDocuments({ role: "guest" });

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({
      ...bookingFilter,
      status: "pending",
    });

    res.json({
      totalProperties,
      totalBookings,
      totalGuests,
      pendingBookings,
      revenue: revenueData[0] || {
        totalRevenue: 0,
        totalPlatformFee: 0,
        totalHostPayout: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/analytics/revenue
// @access Host/Admin
const getRevenueByMonth = async (req, res) => {
  try {
    let hostProperties = [];
    if (req.user.role === "host") {
      const properties = await Property.find({ host: req.user._id });
      hostProperties = properties.map((p) => p._id);
    }

    const revenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "bookingData",
        },
      },
      { $unwind: "$bookingData" },
      ...(req.user.role === "host"
        ? [
            {
              $match: { "bookingData.property": { $in: hostProperties } },
            },
          ]
        : []),
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Format for Recharts
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatted = revenue.map((item) => ({
      month: months[item._id.month - 1],
      revenue: item.revenue,
      bookings: item.bookings,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/analytics/properties
// @access Host/Admin
const getPropertyStats = async (req, res) => {
  try {
    let matchFilter = {};

    if (req.user.role === "host") {
      const hostProperties = await Property.find({ host: req.user._id });
      const propertyIds = hostProperties.map((p) => p._id);
      matchFilter = { property: { $in: propertyIds } };
    }

    const stats = await Booking.aggregate([
      {
        $match: { ...matchFilter, status: { $in: ["confirmed", "completed"] } },
      },
      {
        $group: {
          _id: "$property",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $project: {
          title: "$property.title",
          brand: "$property.brand",
          totalBookings: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/analytics/bookings-by-brand
// @access Admin only
const getBookingsByBrand = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $group: {
          _id: "$property.brand",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Format for Recharts pie chart
    const formatted = stats.map((item) => ({
      name: item._id === "seaAlure" ? "SeaAlure 🏝️" : "SkiAlure 🏔️",
      bookings: item.totalBookings,
      revenue: item.totalRevenue,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/analytics/occupancy
// @access Host/Admin
const getOccupancyRate = async (req, res) => {
  try {
    let propertyFilter = {};

    if (req.user.role === "host") {
      propertyFilter = { host: req.user._id };
    }

    const properties = await Property.find(propertyFilter);

    const occupancyData = await Promise.all(
      properties.map(async (property) => {
        const confirmedBookings = await Booking.find({
          property: property._id,
          status: { $in: ["confirmed", "completed"] },
        });

        // Calculate total booked nights in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const bookedNights = confirmedBookings.reduce((total, booking) => {
          const checkIn = new Date(Math.max(booking.checkIn, thirtyDaysAgo));
          const checkOut = new Date(Math.min(booking.checkOut, new Date()));
          const nights = Math.max(
            0,
            Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
          );
          return total + nights;
        }, 0);

        const occupancyRate = Math.min(
          Math.round((bookedNights / 30) * 100),
          100,
        );

        return {
          name: property.title,
          brand: property.brand,
          occupancyRate,
        };
      }),
    );

    res.json(occupancyData);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getOverview,
  getRevenueByMonth,
  getPropertyStats,
  getBookingsByBrand,
  getOccupancyRate,
};
