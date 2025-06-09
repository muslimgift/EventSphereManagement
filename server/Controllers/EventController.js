const EventModel = require("../Models/EventSchema");
const expoModel = require("../Models/ExpoSchema");
const EventRegistration = require("../Models/EventRegistration");
const Schedule = require("../Models/ScheduleModel");

// Check if any of the booths are booked during the given date range, optionally excluding one event by ID
const isBoothBooked = async (expoCenterId, boothIds, dateFrom, dateTo, excludeEventId = null) => {
  const query = {
    expoCenter: expoCenterId,
    booth: { $in: boothIds },
    dateFrom: { $lte: new Date(dateTo) },
    dateTo: { $gte: new Date(dateFrom) },
  };
  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }
  const booked = await EventModel.findOne(query);
  return !!booked;
};

// Get available booths for a specific expo center and date range
const getAvailableBooths = async (expoCenterId, dateFrom, dateTo) => {
  const expo = await expoModel.findById(expoCenterId);
  if (!expo) throw new Error("Expo center not found");

  const events = await EventModel.find({
    expoCenter: expoCenterId,
    $or: [
      { dateFrom: { $lte: new Date(dateTo) }, dateTo: { $gte: new Date(dateFrom) } },
      { dateFrom: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } },
      { dateTo: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } },
    ],
  });

  const bookedBoothIds = events.flatMap((e) => e.booth);
  return expo.booths.filter((b) => !bookedBoothIds.includes(b.id));
};

const eventController = {
  getEvent: async (req, res) => {
    try {
      const events = await EventModel.find().populate("expoCenter").lean();
      res.json({
        message: "Events fetched successfully",
        status: true,
        data: events,
      });
    } catch (err) {
      res.status(500).json({ status: false, message: "Error fetching events" });
    }
  },

  getEventById: async (req, res) => {
    try {
      const event = await EventModel.findById(req.params.id).populate("expoCenter").lean();
      if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  addEvent: async (req, res) => {
    try {
      const { title, description, theme, dateFrom, dateTo, expoCenter, booth } = req.body;

      if (!Array.isArray(booth) || booth.length === 0) {
        return res.status(400).json({ success: false, message: "Booth must be a non-empty array" });
      }

      const expo = await expoModel.findById(expoCenter);
      if (!expo) {
        return res.status(400).json({ success: false, message: "Expo center not found" });
      }

      // Validate booth IDs exist in ExpoCenter
      const validBoothIds = expo.booths.map((b) => b.id);
      const invalidBooths = booth.filter((bId) => !validBoothIds.includes(bId));
      if (invalidBooths.length > 0) {
        return res.status(400).json({ success: false, message: `Invalid booth IDs: ${invalidBooths.join(", ")}` });
      }

      // Check if booths are booked
      const isBooked = await isBoothBooked(expoCenter, booth, dateFrom, dateTo);
      if (isBooked) {
        return res.status(400).json({ success: false, message: "One or more booths are already booked in this date range" });
      }

      const event = await EventModel.create({ title, description, theme, dateFrom, dateTo, expoCenter, booth });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, theme, dateFrom, dateTo, expoCenter, booth } = req.body;

      if (!Array.isArray(booth) || booth.length === 0) {
        return res.status(400).json({ success: false, message: "Booth must be a non-empty array" });
      }

      const existing = await EventModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      const expo = await expoModel.findById(expoCenter);
      if (!expo) {
        return res.status(400).json({ success: false, message: "Expo center not found" });
      }

      // Validate booth IDs exist in ExpoCenter
      const validBoothIds = expo.booths.map((b) => b.id);
      const invalidBooths = booth.filter((bId) => !validBoothIds.includes(bId));
      if (invalidBooths.length > 0) {
        return res.status(400).json({ success: false, message: `Invalid booth IDs: ${invalidBooths.join(", ")}` });
      }

      // Check if booth or date changed
      const isBoothChanged = JSON.stringify([...existing.booth].sort()) !== JSON.stringify([...booth].sort());
      const isDateChanged =
        existing.dateFrom.toISOString() !== new Date(dateFrom).toISOString() ||
        existing.dateTo.toISOString() !== new Date(dateTo).toISOString();

      if (isBoothChanged || isDateChanged) {
        const isBooked = await isBoothBooked(expoCenter, booth, dateFrom, dateTo, id);
        if (isBooked) {
          return res.status(400).json({ success: false, message: "One or more booths are already booked in this date range" });
        }
      }

      existing.title = title;
      existing.description = description;
      existing.theme = theme;
      existing.dateFrom = dateFrom;
      existing.dateTo = dateTo;
      existing.expoCenter = expoCenter;
      existing.booth = booth;

      await existing.save();
      res.status(200).json({ success: true, data: existing });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await EventModel.findById(id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      const isRegistered = await EventRegistration.exists({ event: id });
      if (isRegistered) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete event: There are registrations linked to this event.",
        });
      }

      const isScheduled = await Schedule.exists({ event: id });
      if (isScheduled) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete event: There are schedules linked to this event.",
        });
      }

      await EventModel.findByIdAndDelete(id);

      res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAvailableBoothCount: async (req, res) => {
    try {
      const { expoCenterId, dateFrom, dateTo } = req.query;
      const availableBooths = await getAvailableBooths(expoCenterId, dateFrom, dateTo);

      res.status(200).json({
        success: true,
        count: availableBooths.length,
        booths: availableBooths,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = eventController;
