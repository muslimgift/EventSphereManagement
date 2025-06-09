const mongoose = require("mongoose");

// Helper functions
const isValidTimeFormat = (time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
const compareTimes = (start, end) => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return endHour > startHour || (endHour === startHour && endMinute >= startMinute);
};

const ScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Schedule title is required"],
  },

  eventtype: {
    type: String,
    required: [true, "Schedule type is required"],
  },

  speaker: {
    type: String,
  },

  StartTime: {
    type: String,
    validate: {
      validator: value => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(value),
      message: "Start time must be in HH:mm format",
    },
    required: true,
  },

  EndTime: {
    type: String,
    required: [true, "End time is required"],
    validate: [
      {
        validator: isValidTimeFormat,
        message: "End time must be in HH:mm format",
      },
      {
        validator: function (value) {
          if (!this.StartTime || !isValidTimeFormat(value)) return true;
          return compareTimes(this.StartTime, value);
        },
        message: "End time must be the same as or after the start time.",
      },
    ],
  },

  scheduledate: {
    type: Date,
    required: [true, "Schedule date is required"],
  },

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  booth: {
    type: [String],
    required: [true, "At least one booth is required"],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "Please provide at least one booth.",
    },
  },

  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const ScheduleModel = mongoose.model("Schedule", ScheduleSchema);
module.exports = ScheduleModel;
