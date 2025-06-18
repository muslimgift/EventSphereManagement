const Schedule = require('../Models/ScheduleModel');
const Event = require('../Models/EventSchema');
const Booth = require('../Models/BoothModel');

// Helper to compare time ranges
const isOverlapping = (startA, endA, startB, endB) => {
  return !(endA <= startB || startA >= endB);
};

// Sync booth.bookedSchedules
const updateBoothSchedule = async ({ scheduleId, eventId, boothIds, date, startTime, endTime, remove = false }) => {
  for (const boothId of boothIds) {
    const booth = await Booth.findById(boothId);
    if (!booth) {
      console.warn(`Booth not found: ${boothId}`);
      continue;
    }

    if (remove) {
      booth.bookedSchedules = booth.bookedSchedules.filter(
        s => s.scheduleId.toString() !== scheduleId.toString()
      );
    } else {
      booth.bookedSchedules.push({
        scheduleId: scheduleId,
        eventId: eventId,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
      });
    }

    try {
      await booth.save();
    } catch (err) {
      console.error(`Failed to update bookedSchedules for booth ${boothId}`, err);
      throw err;
    }
  }
};


const ScheduleController = {
  addSchedule: async (req, res) => {
    try {
      const {
        title,
        eventtype,
        speaker,
        StartTime,
        EndTime,
        scheduledate,
        event,
        booth,
        attendees
      } = req.body;

      const conflicts = await Schedule.find({
        event,
        scheduledate: new Date(scheduledate),
        booth: { $in: booth },
      });

      const conflictBooths = conflicts.filter(existing =>
        isOverlapping(StartTime, EndTime, existing.StartTime, existing.EndTime)
      ).map(conflict => conflict.booth).flat();

      if (conflictBooths.length) {
        return res.status(400).json({
          success: false,
          message: `Booths already scheduled at that time: ${conflictBooths.join(', ')}`,
        });
      }

      const schedule = await Schedule.create({
        title,
        eventtype,
        speaker,
        StartTime,
        EndTime,
        scheduledate,
        event,
        booth,
        attendees
      });

      await updateBoothSchedule({
        scheduleId: schedule._id,
        eventId: event,
        boothIds: booth,
        date: scheduledate,
        startTime: StartTime,
        endTime: EndTime
      });

      res.status(201).json({
        success: true,
        message: "Schedule added successfully",
        data: schedule,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
getTotalScheduleAttendees : async (req, res) => {
  try {
    const schedules = await Schedule.find({}, "attendees"); // Only fetch attendees field

    let totalAttendees = 0;

    schedules.forEach(schedule => {
      totalAttendees += schedule.attendees.length;
    });

    res.status(200).json({
      totalAttendees,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedule attendee count:", error);
    res.status(500).json({ message: "Server error" });
  }
},
editSchedule: async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      eventtype,
      speaker,
      StartTime,
      EndTime,
      scheduledate,
      event,
      booth,
      attendees,
    } = req.body;

    // Find existing schedule
    const oldSchedule = await Schedule.findById(id);
    if (!oldSchedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    // Find potential conflicts: same date, same event, overlapping booths, excluding current schedule
    const conflicts = await Schedule.find({
      _id: { $ne: id },
      event,
      scheduledate: new Date(scheduledate),
      booth: { $in: booth },
    });

    // Extract conflicting booths that have overlapping times
    const conflictBooths = conflicts
      .filter(existing =>
        isOverlapping(StartTime, EndTime, existing.StartTime, existing.EndTime)
      )
      .flatMap(conflict => conflict.booth.map(b => b.toString()));

    const currentBooths = oldSchedule.booth.map(b => b.toString());
    const updatedBooths = booth.map(b => b.toString());

    // Only consider conflicting booths that aren’t part of the current schedule
    const filteredConflicts = conflictBooths.filter(
      b => !currentBooths.includes(b) || !updatedBooths.includes(b)
    );

    if (filteredConflicts.length) {
      return res.status(400).json({
        success: false,
        message: `Conflicting booths already scheduled: ${filteredConflicts.join(', ')}`
      });
    }

    // Proceed to update schedule
    const updated = await Schedule.findByIdAndUpdate(
      id,
      {
        title,
        eventtype,
        speaker,
        StartTime,
        EndTime,
        scheduledate,
        event,
        booth,
        attendees,
      },
      { new: true }
    );

    // Cleanup: Remove old booth schedule links
    await updateBoothSchedule({
      scheduleId: id,
      eventId: event,
      boothIds: oldSchedule.booth,
      remove: true
    });

    // Add updated booth schedule links
    await updateBoothSchedule({
      scheduleId: id,
      eventId: event,
      boothIds: booth,
      date: scheduledate,
      startTime: StartTime,
      endTime: EndTime
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Schedule updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedSchedule = await Schedule.findByIdAndDelete(id);
      if (!deletedSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      await updateBoothSchedule({
        scheduleId: id,
        eventId: deletedSchedule.event,
        boothIds: deletedSchedule.booth,
        remove: true
      });

      res.json({
        success: true,
        message: 'Schedule deleted successfully',
        data: deletedSchedule
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
AddAttendee:async (req, res) => {
  const { userId } = req.body;
  const session = await Schedule.findById(req.params.id);
  if (!session.attendees.includes(userId)) {
    session.attendees.push(userId);
    await session.save();
  }
  res.json(session);

},
RemoveAttendee: async (req, res) => {
  const { userId } = req.body;
  const session = await Schedule.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  // Add these debug logs 👇
  console.log("Removing user:", userId);
  console.log("Current attendees:", session.attendees.map(id => id.toString()));

  const initialCount = session.attendees.length;
  session.attendees = session.attendees.filter(id => id.toString() !== userId.toString());

  if (session.attendees.length === initialCount) {
    return res.status(400).json({ success: false, message: "User was not in the session" });
  }

  await session.save();
  res.json({ success: true, message: "User removed from session", data: session });
},



getAllSchedules: async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('event')
      .populate({ path: 'attendees', model: 'user', select: 'username email' })
      .populate({ path: 'booth', model: 'BoothSchema', select: 'name' }) // Add this

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

  getScheduleById: async (req, res) => {
    try {
      const schedule = await Schedule.findById(req.params.id)
        .populate('event')
        .populate({ path: 'attendees', model: 'user', select: 'username email' });

      if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
      res.json(schedule);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

getAvailableBooths: async (req, res) => {
  try {
    const { eventId, scheduledate, StartTime, EndTime, excludeScheduleId } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const booths = await Booth.find({ expoCenter: event.expoCenter }).lean();

    const conflictsQuery = {
      event: eventId,
      scheduledate: new Date(scheduledate),
    };

    // Exclude current schedule if provided
    if (excludeScheduleId) {
      conflictsQuery._id = { $ne: excludeScheduleId };
    }

    const conflicts = await Schedule.find(conflictsQuery);

    const conflictingBooths = conflicts
      .filter(existing =>
        isOverlapping(StartTime, EndTime, existing.StartTime, existing.EndTime)
      )
      .map(s => s.booth)
      .flat()
      .map(id => id.toString());

    const availableBooths = booths.filter(b => !conflictingBooths.includes(b._id.toString()));

    res.json(availableBooths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},


  getAvailableDatesForEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId);

      if (!event || !event.dateFrom || !event.dateTo) {
        return res.status(404).json({ message: "Event with start/end date not found" });
      }

      const start = new Date(event.dateFrom);
      const end = new Date(event.dateTo);
      const dates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      res.json(dates);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = ScheduleController;
