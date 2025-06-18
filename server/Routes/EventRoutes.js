// routes/eventRoutes.js
const express = require('express');
const eventController = require('../Controllers/EventController');

const router = express.Router();


// ✅ Add new event
router.post('/', eventController.addEvent);
router.post('/interested/:id',eventController.interestedUser);
router.post('/not-interested/:id', eventController.removeInterest);


// ✅ Update event
router.put('/:eventid', eventController.updateEvent);

// ✅ Delete event
router.delete('/:eventId', eventController.deleteEvent);

router.get("/available-booths", eventController.getAvailableBooths);

router.get("/", eventController.getEvent);
router.get("/:eventid", eventController.getEventById);

module.exports = router;
