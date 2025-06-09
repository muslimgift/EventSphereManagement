const express = require('express');
const { registerEvent, getBookedLocations } = require('../Controllers/EventRegistration');
const { exhibitors } = require("../middleware/exhibitorsMiddlewear");
const EventRegistrationController = require('../Controllers/EventRegistration');
const router = express.Router();



router.get("/",EventRegistrationController.getRegisterEvent)
router.get('/:id', EventRegistrationController.getEventRegistrationById);

router.delete("/:id",EventRegistrationController.deleteEventById)

router.put('/:id', exhibitors.single("file"), EventRegistrationController.updateEventRegistrationById)

router.patch("/:id",EventRegistrationController.updateEventRegistrationStatus)

router.post("/", exhibitors.single("file"), registerEvent);

// New route to get booked locations for an event
router.get("/booked-locations/:eventId", getBookedLocations);

module.exports = router;
