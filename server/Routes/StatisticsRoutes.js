const express = require("express");
const router = express.Router();
const { getMonthlyEventScheduleStats } = require("../Controllers/StatisticsController");

router.get("/monthly", getMonthlyEventScheduleStats);

module.exports = router;
