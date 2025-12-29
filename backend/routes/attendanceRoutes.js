const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.get("/summary", attendanceController.getAttendanceSummary);
router.get("/", attendanceController.getAttendance);
router.post("/", attendanceController.saveAttendance);
router.delete("/", attendanceController.deleteAttendance);

module.exports = router;
