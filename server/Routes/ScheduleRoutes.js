
const express = require("express");
const ScheduleController = require("../Controllers/ScheduleController");
const router = express.Router();


router.post('/', ScheduleController.addSchedule);
router.get('/available/booths', ScheduleController.getAvailableBooths);
router.get('/available/dates/:eventId', ScheduleController.getAvailableDatesForEvent);
router.put('/:id', ScheduleController.editSchedule);
router.get('/', ScheduleController.getAllSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.delete('/:id', ScheduleController.deleteSchedule);


module.exports = router;
