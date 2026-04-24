const Property = require("../models/Property");

// @route POST /api/properties
// @access Host/Admin only
const createProperty = async (req, res) => {
  try {
    const {
      brand,
      title,
      description,
      location,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      images,
    } = req.body;

    const property = await Property.create({
      host: req.user._id,
      brand,
      title,
      description,
      location,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      images,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/properties
// @access Public
const getProperties = async (req, res) => {
  try {
    const { brand, minPrice, maxPrice, maxGuests, city } = req.query;

    // Build filter object
    let filter = { isAvailable: true };

    if (brand) filter.brand = brand;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (maxGuests) filter.maxGuests = { $gte: Number(maxGuests) };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/properties/:id
// @access Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "host",
      "name email avatar",
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route PUT /api/properties/:id
// @access Host/Admin only
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Make sure the logged in user is the host
    if (
      property.host.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route DELETE /api/properties/:id
// @access Host/Admin only
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Make sure the logged in user is the host
    if (
      property.host.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
