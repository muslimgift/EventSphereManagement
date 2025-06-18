
const express = require("express");
const ScheduleController = require("../Controllers/ScheduleController");
const router = express.Router();


router.post('/', ScheduleController.addSchedule);
router.post('/join/:id',ScheduleController.AddAttendee);
router.post('/leave/:id',ScheduleController.RemoveAttendee);
router.get('/available/booths', ScheduleController.getAvailableBooths);
router.get('/available/dates/:eventId', ScheduleController.getAvailableDatesForEvent);
router.get("/total-attendees", ScheduleController.getTotalScheduleAttendees);
router.put('/:id', ScheduleController.editSchedule);
router.get('/', ScheduleController.getAllSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.delete('/:id', ScheduleController.deleteSchedule);


module.exports = router;
