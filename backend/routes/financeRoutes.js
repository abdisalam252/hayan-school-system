const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

router.get("/", financeController.getFinance);
router.post("/", financeController.addFinance);
router.delete("/reset-all", financeController.resetFinance);
router.put("/:id", financeController.updateFinance);
router.delete("/:id", financeController.deleteFinance);

module.exports = router;
