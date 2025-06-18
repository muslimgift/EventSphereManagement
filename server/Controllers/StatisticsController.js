const Event = require("../Models/EventSchema");
const Schedule = require("../Models/ScheduleModel");

exports.getMonthlyEventScheduleStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const eventCounts = new Array(12).fill(0);
    const scheduleCounts = new Array(12).fill(0);

    // Fetch Events in current year based on dateFrom
    const events = await Event.find({
      dateFrom: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });

    events.forEach(event => {
      const month = new Date(event.dateFrom).getMonth(); // 0–11
      eventCounts[month]++;
    });

    // Fetch Schedules in current year based on 'date'
    const schedules = await Schedule.find({
      scheduledate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });

    schedules.forEach(schedule => {
      const month = new Date(schedule.scheduledate).getMonth(); // 0–11
      scheduleCounts[month]++;
    });
    res.json({ eventCounts, scheduleCounts });
  } catch (error) {
    console.error("Error generating stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
