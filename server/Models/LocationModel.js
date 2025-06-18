const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
    },
    price: {
      type: Number,
      required: [true, "Location price is required"],
    },
    Booth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoothSchema", // matches the model name you're using
      required: [true, "Associated booth is required"],
    },
    bookedEventRegs: {
      type: [
        {
          eventRegId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EventRegistration",
            required: true,
          },
          eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
          },
          date: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { _id: true }
);

module.exports = mongoose.model("LocationSchema", LocationSchema);
