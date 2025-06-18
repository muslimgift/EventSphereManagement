const EventModel = require("../Models/EventSchema");
const expoModel = require("../Models/ExpoSchema");
const EventRegistration = require("../Models/EventRegistration");
const Schedule = require("../Models/ScheduleModel");
const Booth = require("../Models/BoothModel");
const { addBookedEventToBooths, removeBookedEventFromBooths } = require("./BoothController");

const eventController = {
getAvailableBooths: async (req, res) => {
  try {
    const { expoCenterId, dateFrom, dateTo, excludeEventId } = req.query;

    if (!expoCenterId || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const allBooths = await Booth.find({ expoCenter: expoCenterId }).lean();

    const query = {
      dateFrom: { $lte: end },
      dateTo: { $gte: start },
    };

    // ✅ Exclude the current event from conflict check
    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }

    const overlappingEvents = await EventModel.find(query).lean();

    const bookedBoothIds = new Set();
    overlappingEvents.forEach(event => {
      (event.booths || []).forEach(boothId => bookedBoothIds.add(boothId.toString()));
    });

    const availableBooths = allBooths.filter(
      booth => !bookedBoothIds.has(booth._id.toString())
    );

    res.status(200).json({ booths: availableBooths });
  } catch (err) {
    console.error("Error fetching available booths:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
},

interestedUser: async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await EventModel.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.interestedUser.includes(userId)) {
      event.interestedUser.push(userId);
      await event.save();
    }

    res.json({ message: 'Marked as interested' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
},
// Controller - Remove user from interestedUser array
removeInterest: async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await EventModel.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Remove the userId if it exists
    event.interestedUser = event.interestedUser.filter(id => id.toString() !== userId);
    await event.save();

    res.json({ message: 'Removed from interested list' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
},

getEvent: async (req, res) => {
  try {
    const events = await EventModel.find()
      .populate('expoCenter')
      .populate("booths", "name");

    res.status(200).json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
},


  getEventById: async (req, res) => {
    const { eventid } = req.params;
    try {
      const event = await EventModel.findById(eventid).populate('expoCenter').exec();

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      res.status(500).json({ error: 'Server error while fetching event' });
    }
  },

  addEvent: async (req, res) => {
    try {
      const { title, description, theme, dateFrom, dateTo, expoCenter, booths } = req.body;

      const event = await EventModel.create({
        title,
        description,
        theme,
        dateFrom,
        dateTo,
        expoCenter,
        booths,
      });

      await addBookedEventToBooths({
        body: {
          booths,
          eventId: event._id,
          startDate: dateFrom,
          endDate: dateTo,
        }
      }, {
        status: () => ({ json: () => {} })
      });

      res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
  },

updateEvent: async (req, res) => {
  try {
    const { eventid } = req.params;
    const { title, description, theme, dateFrom, dateTo, expoCenter, booths } = req.body;

    const existingEvent = await EventModel.findById(eventid);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event dates are changing
    const isDateChanged = existingEvent.dateFrom.toISOString() !== new Date(dateFrom).toISOString() ||
                          existingEvent.dateTo.toISOString() !== new Date(dateTo).toISOString();

    // Check if booths are changing
    const existingBoothIds = existingEvent.booths.map(id => id.toString()).sort();
    const newBoothIds = booths.map(id => id.toString()).sort();
    const isBoothChanged = JSON.stringify(existingBoothIds) !== JSON.stringify(newBoothIds);

    // Check if event has schedules or registered booths/locations
    if (isDateChanged || isBoothChanged) {
      const [existingSchedules, existingRegistrations] = await Promise.all([
        Schedule.find({ event: eventid }),
        EventRegistration.find({ event: eventid })
      ]);

      // Check if any EventRegistration contains booth or location info
      const hasBoothOrLocationRegistered = existingRegistrations.some(reg => reg.boothId || reg.locationId);

      if (existingSchedules.length > 0 || hasBoothOrLocationRegistered) {
        return res.status(400).json({
          message: 'Cannot change event dates, booths, or locations because schedules or registrations already exist for this event'
        });
      }
    }

    // Remove old booth references
    await removeBookedEventFromBooths({
      body: {
        booths: existingEvent.booths,
        eventId: existingEvent._id,
      }
    }, {
      status: () => ({ json: () => {} })
    });

    // Update event
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventid,
      { title, description, theme, dateFrom, dateTo, expoCenter, booths },
      { new: true }
    );

    // Add new booth references
    await addBookedEventToBooths({
      body: {
        booths,
        eventId: updatedEvent._id,
        startDate: dateFrom,
        endDate: dateTo,
      }
    }, {
      status: () => ({ json: () => {} })
    });

    res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
},




deleteEvent: async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ⛔ Check if any schedule exists for this event
    const existingSchedules = await Schedule.find({ event: eventId });
    if (existingSchedules.length > 0) {
      return res.status(400).json({ message: 'Cannot delete event with scheduled sessions' });
    }
    const existingEventReg = await EventRegistration.find({ event: eventId });
    if (existingEventReg.length > 0) {
      return res.status(400).json({ message: 'Exhibitor Already registered with this event' });
    }

    // ✅ Remove booth references
    await removeBookedEventFromBooths({
      body: {
        booths: event.booths,
        eventId: event._id,
      }
    }, {
      status: () => ({ json: () => {} })
    });

    await EventModel.findByIdAndDelete(eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
},

};

module.exports = eventController;
