const Schedule = require('../Models/ScheduleModel');
const Event = require('../Models/EventSchema');

// Helper to compare time ranges
const isOverlapping = (startA, endA, startB, endB) => {
  return !(endA <= startB || startA >= endB);
};
let ScheduleController = {
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

    // Ensure booths are available
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

    return res.status(201).json({
      success: true,
      message: "Schedule added successfully",
      data: schedule,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
},


editSchedule : async (req, res) => {
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
      status, // add status field if it's part of the schedule schema
    } = req.body;

    const conflicts = await Schedule.find({
      _id: { $ne: id },
      event,
      scheduledate: new Date(scheduledate),
      booth: { $in: booth },
      status: { $ne: 'cancelled' }, // skip cancelled schedules if applicable
    });

    const conflictBooths = conflicts
      .filter(existing =>
        isOverlapping(StartTime, EndTime, existing.StartTime, existing.EndTime)
      )
      .map(conflict => conflict.booth)
      .flat();

    if (conflictBooths.length) {
      return res.status(400).json({
        success: false,
        message: `Conflicting booths already scheduled: ${conflictBooths.join(', ')}`
      });
    }

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
        status,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Schedule updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
,
deleteSchedule: async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
      data: deletedSchedule
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

getAllSchedules: async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('event')
      .populate({ path: 'attendees', model: 'user', select: 'username email' });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},
getScheduleById : async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('event').populate({ path: 'attendees', model: 'user', select: 'username email' });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

// Get Available Booths for a given event & date & time range
getAvailableBooths : async (req, res) => {
  try {
    const { eventId, scheduledate, StartTime, EndTime } = req.query;

    const event = await Event.findById(eventId).populate("expoCenter");
    if (!event || !event.expoCenter) {
      return res.status(404).json({ message: 'Event or Expo Center not found' });
    }

    const conflicts = await Schedule.find({
      event: eventId,
      scheduledate: new Date(scheduledate),
    });

    const conflictingBooths = conflicts
      .filter(existing => isOverlapping(StartTime, EndTime, existing.StartTime, existing.EndTime))
      .map(s => s.booth);

    // Full booth objects
    const allBooths = event.expoCenter.booths;
    const availableBooths = allBooths.filter(b => !conflictingBooths.includes(b.id));

    res.json(availableBooths);  // this returns full booth objects with id/name/etc.
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
,
// Get Available Dates from Event
getAvailableDatesForEvent : async (req, res) => {
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
}
module.exports = ScheduleController;
