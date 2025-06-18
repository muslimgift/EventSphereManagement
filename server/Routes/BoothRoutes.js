const express = require("express");
const router = express.Router();
const boothController = require("../Controllers/BoothController");

router.post("/", boothController.addBooth);
router.put("/:id", boothController.updateBooth);
router.delete("/:id", boothController.deleteBooth);
router.get("/", boothController.getAllBooths);
router.get("/expo/:expoCenterId", boothController.getBoothByExpoId);
router.get("/:id", boothController.getBoothById);
// router.post('/add-booked-events', boothController.addBookedEventToBooths);
// router.post('/remove-booked-events', boothController.removeBookedEventFromBooths);


module.exports = router;
