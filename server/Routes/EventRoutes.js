// routes/eventRoutes.js
const express = require('express');
const eventController = require('../Controllers/EventController');

const router = express.Router();

// http://localhost:3000/api/event

// ✅ Add new event
router.post('/', eventController.addEvent);

// ✅ Update event
router.put('/:id', eventController.updateEvent);

// ✅ Delete event
router.delete('/:id', eventController.deleteEvent);

// ✅ Get available booth count for a given expo center on a specific date
router.get('/available-booths', eventController.getAvailableBoothCount);

router.get("/", eventController.getEvent);
router.get("/:id", eventController.getEventById);

module.exports = router;
