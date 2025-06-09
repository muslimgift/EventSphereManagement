const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

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
  mapSvg: { type: String, required: [true, "Map svg image is required"] },
  booths: {
    type: [
      {
        id: {
          type: String,
          default: () => nanoid(),
        },
        name: { type: String, required: [true, "Booth name is required"] },
        locations: [
          {
            id: {
              type: String,
              default: () => nanoid(),
            },
            name: { type: String, required: [true, "Location Name is required"] },
            price: { type: Number, required: [true, "Location price is required"] },
            status: {
              type: String,
              enum: ["available", "booked"],
              default: "available",
            },
          },
        ],
        status: {
          type: String,
          enum: ["available", "booked"],
          default: "available",
        },
      },
    ],
    required: [true, "At least one booth is required"],
    validate: {
      validator: function (booths) {
        const seen = new Set();
        for (let b of booths) {
          if (seen.has(b.id)) return false;
          seen.add(b.id);
        }
        return true;
      },
      message: "Booth IDs must be unique within an Expo Center.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExpoCenter", ExpoCenterSchema);
