const mongoose = require("mongoose");

const BoothSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Booth name is required"],
    },
    expoCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpoCenter",
      required: [true, "Associated expo center is required"],
    },

    bookedEvents: {
      type: [
        {
          eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
          },
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
        },
      ],
      default: [],
    },



    bookedSchedules: {
      type: [
        {
          scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
          },
          eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
          },
          date: { type: Date, required: true }, // the day of the schedule slot
          startTime: { type: String, required: true }, // e.g., "10:00 AM"
          endTime: { type: String, required: true },   // e.g., "11:30 AM"
        },
      ],
      default: [],
    },
  },
  { _id: true }
);
module.exports = mongoose.model("BoothSchema", BoothSchema);
