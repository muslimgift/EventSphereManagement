const mongoose = require("mongoose");
const BoothSchema = require("./BoothModel");

const ExpoCenterSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Expo center name is required"] },
  location: {
    city: { type: String, required: [true, "City is required"] },
    address: { type: String, required: [true, "Address is required"] },
    country: { type: String, required: [true, "Country is required"] },
  },
  description: { type: String, required: [true, "Description is required"] },
  images: {
    type: [String],
    required: [true, "At least one image is required"],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Please provide at least one image.",
    },
  },
  facilities: { type: String, default: "" },
  mapSvg: { type: String, required: [true, "Map SVG image is required"] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExpoCenter", ExpoCenterSchema);
