
const mongoose = require("mongoose");

const ExpoCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Expo center name is required"],
  },
  location: {
    city: {
      type: String,
      required: [true, "City is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  images: {
    type: [String],
    required: [true, "At least one image is required"],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "Please provide at least one image.",
    },
  },
  facilities: {
    type: String,
    default: "",
  },
  mapSvg: {
  type: String,
  required: [true, "Map svg image is required"],
},
  booths: {
    type: [
      {
        id: {
          type: String,
          required: [true, "Booth ID is required"],
        },
        name: {
          type: String,
          required: [true, "Booth name is required"],
        },
        locations: [
          {
            id: {
              type: String,
              required: [true, "Location ID is required"],
            },
            name:{
                type:String,
                required:[true, "Location Name is required"],
            },
            price: {
              type: Number,
              required: [true, "Location price is required"],
            },
            status: {
              type: String,
              enum: ["available", "booked"],
              default: "available",
            },
          },
        ],
        status:{
            type: String,
              enum: ["available", "booked"],
              default: "available",
        }
      },
    ],
    required: [true, "At least one booth is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExpoCenter", ExpoCenterSchema);
