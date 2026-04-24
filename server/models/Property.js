const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, enum: ["skiAlure", "seaAlure"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      address: String,
      city: String,
      region: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    images: [{ type: String }], // Cloudinary URLs
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    amenities: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Property", propertySchema);
