const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
  },
  description: {
    type: String,
    required: [true, "Event description is required"],
  },
  theme: {
    type: String,
    required: [true, "Event theme is required"],
  },
  dateFrom: {
    type: Date,
    required: [true, "Start date is required"],
  },
  dateTo: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (value) {
        return !this.dateFrom || value >= this.dateFrom;
      },
      message: "End date must be the same as or after the start date.",
    },
  },
  expoCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpoCenter",
    required: [true, "Associated expo center is required"],
  },
  booths: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoothSchema",
      required: true,
    },
  ],
  interestedUser:[
    {
type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", EventSchema);
