const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");

router.get("/", libraryController.getBooks);
router.post("/", libraryController.addBook);
router.put("/:id", libraryController.updateBook);
router.delete("/:id", libraryController.deleteBook);

module.exports = router;
