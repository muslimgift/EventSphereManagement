const express = require("express");
const router = express.Router();
const locationController = require("../Controllers/LocationController");

router.post("/", locationController.addLocation);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);
router.get("/", locationController.getAllLocations);
router.get("/booth/:boothId", locationController.getLocationsByBooth);
router.get("/allbooth/:boothId",locationController.getAllLocationsByBooth)
router.get("/:id", locationController.getLocationById);


module.exports = router;
