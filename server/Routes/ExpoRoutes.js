const express = require('express')
const expoController = require('../Controllers/ExpoController');
const upload = require('../middleware/uploadMiddlewear');
const router = express.Router()

// http://localhost:3000/api/expo
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "mapSvg", maxCount: 1 },
  ]),
  expoController.createExpoCenter
);

router.get("/", expoController.getExpoCenters);
router.get("/:id", expoController.getExpoCenterById);
router.delete("/:id", expoController.deleteExpoCenter);

module.exports = router