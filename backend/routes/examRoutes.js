const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

// Exam Management
router.get("/", examController.getExams);
router.post("/", examController.createExam);
router.delete("/:id", examController.deleteExam);

// Results Management
router.get("/:id/results", examController.getExamResults);
router.post("/:id/results", examController.saveExamResults);

// Report Card Route
router.get("/student/:studentId/report", examController.getStudentReportCard);

module.exports = router;
