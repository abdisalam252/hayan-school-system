const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");

// Define routes
router.get("/student/:studentId", issueController.getStudentIssues);
router.post("/", issueController.createIssue);
router.put("/:id", issueController.updateIssue);
router.delete("/:id", issueController.deleteIssue);

module.exports = router;
